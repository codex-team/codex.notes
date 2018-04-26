/**
 * Abstract class for all entities that need to be synchronized
 *
 * For example Note, Folder, User are Syncable Entities so that they need to be extended by this class
 * Prepares changed data to send to the cloud
 *
 * Models must implement getters data according to the syncableType that returns object with syncable data.
 * See an example from Models: User, Folder, Note.
 */
class Syncable {

  /**
   * @constructor
   */
  constructor() { }

  /**
   * @abstract
   * Get from queue updated Entities
   * Make model instance with entity id and returns an array with Model's data
   * @return {Array[]}
   */
  static async prepareUpdates() {

    /** Here we getting Entity Ids from Queue */
    let syncingData = await global.app.syncQueue.getAll( this.syncableType );

    /** Getting Entity models */
    return Promise.all(syncingData.map( ( data ) => {
      return this.get( data.entityId );
    }))
      .then( models => {
        /** Returning Only Data */
        return models.map( model => {
          return model.data;
        });
      });

  };

  /**
   * Return syncable entity's data by id.
   * Method should be implemented by inheritor.
   *
   * @abstract
   * @param {string} id - syncable entity's id
   * @return {object}
   */
  static async get(id){
    throw new Error('Syncable data loader must be implemented by subclass');
  }

  /**
   * Return entity's data.
   * Method should be implemented by inheritor.
   *
   * @abstract
   * @return {object}
   */
  static get data() {
    throw new Error('Syncable data loader must be implemented by subclass');
  }
}

module.exports = Syncable;
