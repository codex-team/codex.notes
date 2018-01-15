const db = require('../utils/database');
const Notes = require('../models/note');


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
 * @property {Directory} folders    - Folders Model
 * @property {Notes} notes          - Notes Model
 * @property {GraphQLClient} api    - GraphQL API client
 * @property {Array} subscribers    - Provides simple EventEmitter {@link SyncObserver#on}
 */
module.exports = class SyncObserver {

  /**
   * Initialize params for the API
   */
  constructor() {
    this.api = new GraphQLClient(process.env.API_ENDPOINT, {
      headers: {
        // Bearer scheme of authorization can be understood as 'give access to the bearer of this token'
        Authorization: 'Bearer ' + global.user.token,
      }
    });

    this.subscribers = [];
  }

  /**
   * Prepare updates for API during synchronization
   * @param {Number} lastSyncDate - Date of last synchronisation
   * @return {{folders: []|null, notes: []|null}}
   */
  async prepareUpdates(lastSyncDate) {
    try {
      let changedFolders = await db.find(db.FOLDERS, {
        dtModify: {$gte: lastSyncDate}
      });

      return {
        folders: changedFolders,
        notes: null
      };

    } catch (err) {
      console.log('Error during synchronization prepareUpdates: ', err);
      return false;
    }
  }

  /**
   * Sync changes with API server
   */
  async sync() {

    let lastSyncDate = await global.user.getSyncDate();
    let currentTime = +new Date();

    /**
     * Get new updates from the last sync date
     * @type {{folders: []|null, notes: []|null}}
     */
    let updates = await this.prepareUpdates(lastSyncDate);

    console.log('SyncObserver: updates are ready for sending to the Cloud:', updates);

    /**
     * Send Folders mutations
     */
    if (updates.folders) {
      updates.folders.forEach( folder => {
        this.sendFolder(folder);
      });
    }

    /**
     * Renew synchronisation date
     */
    global.user.setSyncDate(currentTime).then((resp) => {
      console.log('Synchronisation\'s date updated', currentTime, resp);
    });

    this.getUpdates();
  }
  /**
   * Requests updates from the cloud
   */
  getUpdates(){

    /**
     * Sync Query
     * @type {String}
     */
    let query = require('../graphql/sync');

    let syncVariables = {
      userId: global.user ? global.user.id : null
    };

    this.api.request(query, syncVariables)
      .then( data => {
        console.log('\n( ͡° ͜ʖ ͡°) SyncObserver received data: \n\n', data);
        this.emit('sync', data);
      })
      .catch( error => {
        console.log('[!] Synchronization failed because of ', error);
      });
  }

  /**
   * Emit Event to the each subscriber
   * @param {String} event - Event name
   * @param {*} data       - Data to pass with Event
   */
  emit(event, data) {

    this.subscribers.forEach(sub => {
      if (sub.event !== event) {
        return;
      }

      sub.callback.call(null, data);
    });

  }

  /**
   * Add subscriber to the passed event
   * @param {String} event - on what SyncObserver Event you want to subscribe
   * @param {Function} callback - what callback we should fire with the Event
   */
  on(event, callback) {
    this.subscribers.push({
      event,
      callback
    });
  }

  /**
   * Send Folder Mutation
   * @param {FolderData} folder
   */
  sendFolder(folder){
    let query = require('../graphql/mutations/folder');

    let variables = {
      ownerId: global.user ? global.user.id : null,
      id: folder._id,
      title: folder.title || '',
      dtModify: folder.dtModify ? parseInt(folder.dtModify / 1000, 10) : null,
      dtCreate: folder.dtCreate ? parseInt(folder.dtCreate / 1000, 10): null
    };

    this.api.request(query, variables)
      .then( data => {
        console.log('\n(ღ˘⌣˘ღ) SyncObserver sends Folder Mutation: \n\n', data);
      })
      .catch( error => {
        console.log('[!] Folder Mutation failed because of ', error);
      });
  }
};
