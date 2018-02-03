const db = require('../utils/database');

const Folder = require('../models/folder');
const Note = require('../models/note');

const controllerFolder = require('./folders');
const controllerNotes = require('./notes');

/**
 * Load utils
 *
 * @type {Utils}
 */
const utils = require('../utils/utils');

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
 * @class SyncObserver
 *
 * Sends new changes to the API server
 * Accepts changes from the API server
 *
 * @typedef {SyncObserver} SyncObserver
 * @property {GraphQLClient} api    - GraphQL API client
 */
class SyncObserver {

  /**
   * Initialize params for the API
   */
  constructor() {
    this.api = null;

    this.refreshClient();
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
      }
    });
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
   * @returns {bool}
   */
  async sync() {
    try {
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
      let updatedUser = this.updateUserLastSyncDate();

      /** @todo а тру ли надо вернуть? */

      return dataFromCloud; // fix it later
    } catch(e) {
      console.log('[syncObserver] Error:', e);
      return false;
    }
  }

  /**
   * Requests data from the cloud
   *
   * @return {Promise<object>}
   */
  getDataFromCloud() {
    console.log('[syncObserver] Get data from the Cloud');

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
        console.log('( ͡° ͜ʖ ͡°) SyncObserver received data:', (data), '\n');
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
    console.log('\n\n\n\n\n\n dataFromCloud received ------->>>>>:', utils.objJSON(dataFromCloud) );
    console.log('Root folder id ----->', await db.getRootFolderId() );
    console.log('[syncObserver] Update local data');

    let folders = dataFromCloud.user.folders;

    folders = await Promise.all(folders.map( async folder => {
      folder._id = folder.id;

      /**
       * Create Folder model
       *
       * @type {Folder}
       */
      let localFolder = new Folder(folder);

      /**
       * Save Folder's data
       */
      localFolder = await localFolder.save();

      /**
       * Get Folder's Notes
       *
       * @type {*|Array|NotesController}
       */
      localFolder.notes = await Promise.all(folder.notes.map( async note => {
        note._id = note.id;

        /**
         * Create Note model
         *
         * @type {Note}
         */
        let localNote = new Note(note);

        /**
         * Save Note's data
         */
        return await localNote.save();
      }));

      return localFolder;
    }));

    return folders;
  }

  /**
   * Prepare local updates for this moment
   *
   * @return {{folders: []|null, notes: []|null}}
   */
  async getLocalUpdates() {
    console.log('[syncObserver] Prepare local updates');

    /**
     * Get last sync date
     *
     * @type {Number}
     */
    let lastSyncTimestamp = await global.user.getSyncDate();

    /**
     * Get not synced Folders
     */
    let changedFolders = await db.find(db.FOLDERS, {
      dtModify: {$gte: lastSyncTimestamp}
    });

    /**
     * Get not synced Notes
     */
    let changedNotes = await db.find(db.NOTES, {
      dtModify: {$gte: lastSyncTimestamp}
    });

    return {
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
    console.log('[syncObserver] Create Sync Mutations Sequence');
    // console.log('LOCAL UPDATES:', updates);

    /**
     * Sequence of mutations requests
     * @type {Array}
     */
    let syncMutationsSequence = [];

    /**
     * Push Folders mutations to the Sync Mutations Sequence
     */
    if (updates.folders.length) {
      syncMutationsSequence.push(...updates.folders.map( folder => {
        return this.sendFolder(folder);
      }));
    }

    /**
     * Push Notes mutations to the Sync Mutations Sequence
     */
    if (updates.notes.length) {
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
    console.log('[syncObserver] Update user\'s last sync date');

    /** Update user's last sync date */
    let currentTime = Time.now;

    return await global.user.setSyncDate(currentTime);
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
      ownerId: global.user ? global.user.id : null,
      id: folder._id,
      title: folder.title || '',
      dtModify: folder.dtModify || null,
      dtCreate: folder.dtCreate || null,
      isRemoved: folder.isRemoved || null,
      isRoot: folder.isRoot
    };

    return this.api.request(query, variables)
      .then( data => {
        console.log('(ღ˘⌣˘ღ) SyncObserver sends Folder Mutation and received a data:', data, '\n');
      })
      .catch( error => {
        console.log('[!] Folder Mutation failed because of ', error);
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
      isRemoved: note.isRemoved || null
    };

    return this.api.request(query, variables)
      .then( data => {
        console.log('(ღ˘⌣˘ღ) SyncObserver sends Note Mutation and received a data:', data, '\n');
      })
      .catch( error => {
        console.log('[!] Note Mutation failed because of ', error);
      });
  }
};

module.exports = SyncObserver;
