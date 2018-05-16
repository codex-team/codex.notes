/**
 * Manipulates with with synchronization queue
 * Resolves problem with syncing the updated entities — which Note or Folder was changed and need to be updated in the cloud
 */

'use strict';

const SyncableItem = require('../models/syncableItem');

/** Database adapter */
const db = require('../utils/database');

/**
 * @class syncQueue
 * Class creates pull of entity queue to send to the cloud
 */
class syncQueue {
  /**
   * @constructor
   */
  constructor() {}

  /**
   * Push to the queue if data is valid
   * @param {SyncQueueData} queueData
   */
  async add(queueData) {
    /**
     * @type {SyncableItem}
     *
     * Each queue data must satisfy SyncableItem structure
     */
    let queueObject = new SyncableItem(queueData);

    if (queueObject.isValid()) {
      let query = {
        type : queueObject.data.type,
        entityId : queueObject.data.entityId
      };

      let dataToSave = {
        $set: queueObject.data
      };

      let options = {
        upsert: true,
        returnUpdatedDocs: true
      };

      let updateResponse = await db.update(db.SYNCQUEUE, query, dataToSave, options);

      return updateResponse.affectedDocuments;
    } else {
      throw new Error('Data is not valid');
    }
  }

  /**
   * Returns all items in queue with given entity type
   * @param {Number} entityType - Entity type. To see the examples, look at models that are syncable. Model Folder has type of 2
   * @return {Promise.<SyncQueueData[]>}
   */
  async getAll(entityType) {
    return await db.find(db.SYNCQUEUE, {
      type : entityType
    });
  }

  /**
   * Remove queue state
   */
  async flushAll() {
    return await db.remove(db.SYNCQUEUE, {}, {multi: true});
  }
}

module.exports = syncQueue;
