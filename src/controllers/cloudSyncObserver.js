const Folder = require('../models/folder');
const Note = require('../models/note');
const Collaborator = require('../models/collaborator');
const User = require('../models/user');

/**
 * Time helper
 *
 * @type {Time}
 */
const Time = require('../utils/time');

/**
 * Simple GraphQL requests provider
 * {@link https://github.com/graphcool/graphql-request}
 */
const { GraphQLClient } = require('graphql-request');

/**
 * @class CloudSyncObserver
 *
 * Sends new changes to the API server
 * Accepts changes from the API server
 *
 * @typedef {CloudSyncObserver} CloudSyncObserver
 * @property {GraphQLClient} api    - GraphQL API client
 */
class CloudSyncObserver {
  /**
   * Initialize params for the API
   */
  constructor() {
    this.api = null;

    this.refreshClient();

    this.syncingInterval = setInterval(() => {
      this.sync(true);
    }, 60 * 1000 ); // every 60 sec
  }

  /**
   * Makes a new GraphQL client with the new auth-token
   * It used by {@link AuthController#googleAuth}
   */
  refreshClient() {
    this.api = new GraphQLClient(process.env.API_ENDPOINT, {
      headers: {
        /**
         * Bearer scheme of authorization can be understood
         *  as 'give access to the bearer of this token'
         */
        Authorization: 'Bearer ' + global.user.token,

        /**
         * Device-Id header uses to identify client's app
         */
        'Device-Id': global.deviceId
      }
    });

    if (global.user.channel) {
      this.openUserChannel();
    }
  }

  /**
   * Open user's notifications channel
   */
  openUserChannel() {
    global.app.sockets.listenChannel(global.user.channel, (message) => {
      this.gotNotify(message);
    });
  }

  /**
   * Notify got from the Socket
   *
   * @param {object} message
   * @param {string} message.event - notify event ('folder updated', 'collaborator invited');
   * @param {object} message.data - payload
   * @param {User}   message.sender - sender information. This is a user that made changes
   *
   * @return {void}
   */
  gotNotify(message = {}) {
    if (!message.event) {
      global.logger.debug('WARN: got notification in incorrect format', message);
      return;
    }

    global.logger.debug(`\n\nNew message in channel: ${message.event} => ${global.utils.print(message.data)}\n\n\n`);

    switch (message.event) {
      case 'folder updated':

        /**
         * @todo Move to the separated handler
         */
        let updatedFolder = message.data;

        global.app.pushNotifications.send({
          title: updatedFolder.title,
          message: message.sender.name + ' updated folder'
        });

        this.saveFolder(message.data);

        break;
      case 'folder renamed':
        let renamedFolder = message.data;

        global.app.pushNotifications.send({
          title: renamedFolder.title,
          message: message.sender.name + ' renamed folder'
        });

        this.saveFolder(message.data);

        break;
      case 'note updated':
        let folderId = message.data.folderId;
        this.saveNote(message.data, {_id: folderId})
          .then( (note) => {
            let notification = {
              title   : note.title || note.titleLabel,
              message : message.sender.name + ' edited the note'
            };

            if ( message.data.folder && message.data.folder.title ) {
              notification.message += ' at ' + message.data.folder.title;
            }

            /**
             * Do not send push notification if sender is you
             * We handle this case because user may have several devices and we must get updates by sockets but without notification
             */
            if (global.user.id != message.sender.id) {
              global.app.pushNotifications.send(notification);
            }


          });
        break;
      case 'collaborator invited':
        this.saveCollaborator(message.data, message.data.folderId);
        global.app.clientSyncObserver.sendCollaborator(message.data);
        break;
      case 'collaborator joined':
        let notification = {
          title : message.data.folder.title,
          message : message.data.user.name + ' joined the folder'
        };
        global.app.pushNotifications.send(notification);
        break;
      default:
    }
  }

  /**
   * Sync changes with API server
   *
   * 1. Get data from the Cloud
   *
   * 2. Update local data if Cloud item's
   *    dtModify is greater than local
   *
   * 3. Prepare local updates: local item's
   *    dtModify is greater than user's last sync date
   *
   * 4. Create Sync Mutations Sequence
   *
   * 5. Update user's last sync date
   *
   * @param {boolean} getDataFromCloud
   *
   // * @returns {bool}
   */
  async sync(getDataFromCloud = false) {
    try {
      // if user is not authorized
      if (!global.user.token) {
        return;
      }

      if (getDataFromCloud) {
        /**
         * Get data from the Cloud
         *
         * @type {Object}
         */
        let dataFromCloud = await this.getDataFromCloud();

        /**
         * Update local data if Cloud item's
         *    dtModify is greater than local.
         */
        let updatedLocalItems = await this.saveDataFromCloud(dataFromCloud);
      }

      /**
       * Prepare local updates for this moment
       */
      let preparedLocalUpdates = await this.getLocalUpdates();

      /**
       * Create Sync Mutations Sequence
       */
      let syncMutations = await this.syncMutationsSequence(preparedLocalUpdates);

      /**
       * Update user's last sync date
       */
      let updatedUser = await this.updateUserLastSyncDate();

      /**
       * Flush Queue after we sent mutations
       */
      await global.app.syncQueue.flushAll();

      // return dataFromCloud;

    } catch(e) {
      global.logger.debug('[cloudSyncObserver] Error: %s', e);
      return false;
    }
  }

  /**
   * Requests data from the cloud
   *
   * @return {Promise<object>}
   */
  getDataFromCloud() {
    global.logger.debug('[cloudSyncObserver] Get data from the Cloud');

    /**
     * Sync Query
     *
     * @type {String}
     */
    let query = require('../graphql/sync');

    let syncVariables = {
      userId: global.user ? global.user.id : null
    };

    return this.api.request(query, syncVariables)
      .then( data => {
        // global.logger.debug('( ͡° ͜ʖ ͡°) CloudSyncObserver received data:', (data), '\n');
        return data;
      });
  }

  /**
   * Update local data
   *
   * @param dataFromCloud
   *
   * @returns {object}
   */
  async saveDataFromCloud(dataFromCloud) {
    global.logger.debug('[cloudSyncObserver] Update local data');

    let folders = dataFromCloud.user.folders;

    return Promise.all(folders.map( async folder => {
      return await this.saveFolder(folder);
    }));
  }

  /**
   * Save a Folder got from the Cloud
   *
   * @param {FolderData} folderData - Folder data from Cloud
   *
   * @return {Promise<Folder>}
   */
  async saveFolder(folderData) {
    folderData._id = folderData.id;

    /**
     * Create Folder model
     *
     * @type {Folder}
     */
    let localFolder = new Folder(folderData);

    /**
     * Save Folder's data
     */
    localFolder = await localFolder.save();

    /**
     * Get Folder's Notes
     *
     * @type {*|Array|NotesController}
     */
    if (folderData.notes) {
      localFolder.notes = await Promise.all(folderData.notes.map(async note => {
        return await this.saveNote(note, folderData);
      }));
    }

    /**
     * Get Folder's Collaborators
     *
     * @type {Array}
     */
    if (folderData.collaborators) {
      localFolder.collaborators = await Promise.all(folderData.collaborators.map( async collaborator => {
        return await this.saveCollaborator(collaborator, folderData);
      }));
    }

    return localFolder;
  }

  /**
   * Save a Note got from the Cloud
   *
   * @param {NoteData} noteData - Note data from Cloud
   * @param {Folder} folder - Folder contains a Note
   *
   * @return {NoteData}
   */
  async saveNote(noteData, folder){
    noteData._id = noteData.id;

    /**
     * Create Note model
     *
     * @type {Note}
     */
    let note = new Note(noteData);

    /**
     * We does not receive note.folderId from the Sync Query
     */
    note.folderId = folder._id;

    /**
     * Save Note's data
     */
    return await note.save();
  }

  /**
   * Save Folder's Collaborator got from the Cloud
   *
   * @param {CollaboratorData} collaborator - Collaborator data from Cloud
   * @param {FolderData} folder - Folder contains a Collaborator
   *
   * @return {Promise<void>}
   */
  async saveCollaborator(collaborator, folder) {
    collaborator._id = collaborator.id;

    /**
     * Create Collaborator model
     *
     * @type {Collaborator}
     */
    let localCollaborator = new Collaborator(collaborator);

    localCollaborator.folderId = folder._id;
    localCollaborator.ownerId = folder.ownerId;

    /**
     * Save Collaborator's data
     */
    return await localCollaborator.save();
  }

  /**
   * Prepare local updates for this moment
   *
   * @return {{folders: []|null, notes: []|null}}
   */
  async getLocalUpdates() {

    /**
     * Get not synced User
     */
    let changedUser = await User.prepareUpdates();

    /**
     * Get not synced Folders
     */
    let changedFolders = await Folder.prepareUpdates();

    /**
     * Get not synced Notes
     */
    let changedNotes = await Note.prepareUpdates();

    global.logger.debug('[cloudSyncObserver] Prepare local updates');
    // global.logger.debug('[cloudSyncObserver] Prepare local updates', changedUser, changedNotes, changedFolders);

    return {
      user: changedUser,
      folders: changedFolders,
      notes: changedNotes
    };
  }

  /**
   * Send Mutations
   *
   * @param updates
   *
   * @returns {Promise[]}
   */
  async syncMutationsSequence(updates) {
    global.logger.debug('[cloudSyncObserver] Create Sync Mutations Sequence');

    /**
     * Sequence of mutations requests
     * @type {Array}
     */
    let syncMutationsSequence = [];

    /**
     * Push User mutations to the Sync Mutations Sequence
     */
    if (updates.user) {
      syncMutationsSequence.push(this.sendUser(user));
    }

    /**
     * Push Folders mutations to the Sync Mutations Sequence
     */
    if (updates.folders && updates.folders.length) {
      syncMutationsSequence.push(...updates.folders.map( folder => {
        return this.sendFolder(folder);
      }));
    }

    /**
     * Push Notes mutations to the Sync Mutations Sequence
     */
    if (updates.notes && updates.notes.length) {
      syncMutationsSequence.push(...updates.notes.map( note => {
        return this.sendNote(note);
      }));
    }

    return await Promise.all(syncMutationsSequence);
  }

  /**
   * Update user's last sync date
   *
   * @returns {Object}
   */
  async updateUserLastSyncDate() {
    global.logger.debug('[cloudSyncObserver] Update user\'s last sync date');

    /** Update user's last sync date */
    let currentTime = Time.now;

    return await global.user.setSyncDate(currentTime);
  }

  /**
   * Send User Mutation
   *
   * @param {UserData} user
   *
   * @return {Promise<object>}
   */
  sendUser(user) {
    let query = require('../graphql/mutations/user');

    let variables = {
      id: user.id,
      name: user.name,
      photo: user.photo,
      email: user.email,
      dtReg: user.dt_reg,
      dtModify: user.dtModify,
    };

    return this.api.request(query, variables)
      .then( data => {
        global.logger.debug('(ღ˘⌣˘ღ) CloudSyncObserver sends User Mutation ', variables, ' and received a data:', data, '\n');
      })
      .catch( error => {
        global.logger.debug('[!] User Mutation failed because of %s', error);
      });
  }

  /**
   * Send Folder Mutation
   *
   * @param {FolderData} folder
   *
   * @return {Promise<object>}
   */
  sendFolder(folder) {
    let query = require('../graphql/mutations/folder');

    let variables = {
      id: folder._id,
      title: folder.title || '',
      dtModify: folder.dtModify || null,
      dtCreate: folder.dtCreate || null,
      isRemoved: folder.isRemoved,
      isRoot: folder.isRoot
    };

    if (folder.ownerId) {
      variables.ownerId = folder.ownerId;
    } else if (global.user) {
      variables.ownerId = global.user.id;
    } else {
      variables.ownerId = null;
    }

    return this.api.request(query, variables)
      .then( data => {
        global.logger.debug('(ღ˘⌣˘ღ) CloudSyncObserver sends Folder Mutation %s and received a data: %s', variables, data);
      })
      .catch( error => {
        global.logger.debug('[!] Folder Mutation failed because of %e', error);
      });
  }

  /**
   * Send CollaboratorInvite Mutation
   *
   * @param {Collaborator} collaborator - Collaborator to send message
   *
   * @return {Promise<void>}
   */
  sendCollaboratorInvite(collaborator) {
    let query = require('../graphql/mutations/invite');

    let variables = {
      id: collaborator._id,
      email: collaborator.email,
      ownerId: global.user ? global.user.id : null,
      folderId: collaborator.folderId,
      dtInvite: collaborator.dtInvite
    };

    return this.api.request(query, variables)
      .then(data => {
        global.logger.debug('\n(ღ˘⌣˘ღ) CloudSyncObserver sends InviteCollaborator Mutation and received a data: %s', data);
      })
      .catch(error => {
        global.logger.debug('[!] InviteCollaborator Mutation failed because of %s', error);
        throw new Error(error);
      });
  }

  /**
   * Send CollaboratorInvite Mutation
   *
   * @param {string} ownerId - id of Folder's owner
   * @param {string} folderId - Folder's id
   * @param {string} token - Collaborator's invitation token
   *
   * @return {Promise<object>}
   */
  sendVerifyCollaborator(ownerId, folderId, token) {
    let query = require('../graphql/mutations/join');

    let variables = {
      userId: global.user ? global.user.id : null,
      ownerId: ownerId,
      folderId: folderId,
      token: token
    };

    return this.api.request(query, variables)
      .then(data => {
        global.logger.debug('\n(ღ˘⌣˘ღ) CloudSyncObserver sends CollaboratorJoin Mutation and received a data: %s', data);
      })
      .catch(error => {
        global.logger.debug('[!] CollaboratorJoin Mutation failed because of %s', error);
      });
  }

  /**
   * Send Notes Mutation
   *
   * @param {NoteData} note
   *
   * @return {Promise<object>}
   */
  sendNote(note) {
    let query = require('../graphql/mutations/note');

    let variables = {
      id: note._id,
      authorId: global.user ? global.user.id : null,
      folderId: note.folderId,
      title: note.title || '',
      content: note.content,
      dtModify: note.dtModify || null,
      dtCreate: note.dtCreate || null,
      isRemoved: note.isRemoved
    };

    return this.api.request(query, variables)
      .then( data => {
        global.logger.debug('(ღ˘⌣˘ღ) CloudSyncObserver sends Note Mutation %s and received a data: %s', variables, data);
      })
      .catch( error => {
        global.logger.debug('[!] Note Mutation failed because of %s', error);
      });
  }

}

module.exports = CloudSyncObserver;
