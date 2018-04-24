/**
 */

/** Database adapter */
const db = require('../utils/database');

/**
 * @typedef {Object} SyncQueueData
 * @property {String} type - entity type. For example — Note, Folder, Visit and so on
 * @property {String} entityId - entity id. Unified entity identifier
 */
class SyncQueue {

  /**
   * Constructor get's entity
   * @param {SyncQueueData} data
   */
  constructor( data ) {
    this._id = null;
    this.type = data.type || null;
    this.entityId = data.entityId || null;
  }

  /**
   * @return {SyncQueueData} data
   */
  get data() {
    return {
      type : this.type,
      entityId : this.entityId
    }
  }

  /**
   * Save Entity information to the queue
   */
  async save() {
    let query = {
      type : this.type,
      entityId : this.entityId
    };

    let dataToSave = {
      $set: this.data
    };

    let options = {
      upsert: true,
      returnUpdatedDocs: true
    };

    let updateResponse = await db.update(db.SYNCQUEUE, query, dataToSave, options);
    return updateResponse.affectedDocuments;
  }

  /**
   * Returns queue state
   * @return {Promise.<Array[SyncQueueData]>}
   */
  static async getAll( entityType ) {
    return await db.find(db.SYNCQUEUE, {
      type : entityType
    });
  }

  /**
   * Remove queue state
   */
  flush() {

  }

}

module.exports = SyncQueue;
