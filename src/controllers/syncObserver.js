const Notes = require('../models/notes');
const Directory = require('../models/folder');

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
    this.notes = new Notes();

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
   * @param {string} dt_sync – last synchronization timestamp
   * @returns {object} {
   *    {object} dt_sync – last synchronization timestamp,
   *    {object} updates {
   *      {string} folders - list of fresh folders,
   *      {object} notes - list of fresh notes
   *    }
   * }
   */
  async prepareUpdates(dt_sync) {
    try {
      // let newFolders = await this.folders.getUpdates(dt_sync);
      // let newNotes = await this.notes.getUpdates(dt_sync);

      // return {
      //   'dt_sync': dt_sync,
      //   'updates': {
      //     'folders': newFolders,
      //     'notes': newNotes
      //   }
      // };
    } catch (err) {
      console.log('Error during synchronization getUpdates: ', err);
      return false;
    }
  }

  /**
   * Sync changes with API server
   * @param {string} dt_sync – last synchronization timestamp
   */
  async sync(dt_sync) {
    let updates = await this.prepareUpdates(dt_sync);

    // console.log(JSON.stringify(updates));
    // @TODO: Send updates to API server
    // @TODO: Receive updates from API server
    // @TODO: Apply updates

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

    this.api.request(query)
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
};
