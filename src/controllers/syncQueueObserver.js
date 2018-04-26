/**
 * @module syncQueueObserver
 * Manipulates with entity Queue
 * Resolves problem with syncing the updated entities — which Note or Folder was changed and need to be updated in the cloud
 */

'use strict';

const SyncQueue = require('../models/syncQueue');

/**
 * @class syncQueueObserver
 * Class creates pull of entity queue to send to the cloud
 */
class syncQueueObserver {

  /**
   * @constructor
   */
  constructor() { }

  /**
   * Push to the queue
   * @param {SyncQueueData} queueData
   */
  async push( queueData ) {

    let queueObject = new SyncQueue( queueData );
    return await queueObject.save();
  }

  /**
   * @param {Number} modelType - Entity type. To see the examples, look at models that are syncable. Model Folder has type of 2
   * @return {Promise.<Array, SyncQueueData[]>}
   */
  async getSyncableQueue( modelType ) {
    return await SyncQueue.getAll( modelType )
  }

  /**
   * Flush Queue state
   * @return {Promise}
   */
  async flushAll() {
    return await SyncQueue.flush();
  }
}

module.exports = syncQueueObserver;
