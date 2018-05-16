/**
 * Structure for syncable entities
 * Each queue data must be corresponded by data that describes this class
 *
 * Queue Data Example:
 *  1. type - entity type (it can be Note, Folder, User etc..)
 *  2. entityId - entity's identifier.
 */

/**
 * @typedef {Object} SyncQueueData
 * @property {String} type - entity type. For example — Note, Folder, Visit and so on
 * @property {String} entityId - entity id. Unified entity identifier
 */
class SyncableItem {
  /**
   * Constructor get's entity
   * @param {SyncQueueData} data
   */
  constructor(data) {
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
    };
  }

  /**
   * check data validness
   * @return {Boolean}
   */
  isValid() {
    return !!(this.data.type && this.data.entityId);
  }
}

module.exports = SyncableItem;
