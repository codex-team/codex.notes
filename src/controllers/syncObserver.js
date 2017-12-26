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
 */
module.exports = class SyncObserver {

  /**
   * Initialize params for the API
   */
  constructor() {
    // this.folders = new Directory();
    this.notes = new Notes();

    this.api = new GraphQLClient(process.env.API_ENDPOINT, {
      headers: {
        // Authorization: 'Put JWT here for authorization',
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
        console.log('now will emit');
        this.emit('sync', data);
      })
      .catch( error => {
        console.log('[!] Synchronization failed because of ', error);
      });
  }

  emit(event, data){

    this.subscribers.forEach(sub => {
      if (sub.event !== event){
        return;
      }

      sub.callback.call(null, data);
    });

    console.log(event, data);

  }

  on(event, callback){
    this.subscribers.push({
      event,
      callback
    });
  }
};
