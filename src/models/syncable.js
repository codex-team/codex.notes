/**
 * @module Syncable
 * Abstract class for all entities that need to be synchronized
 *
 * For example Note, Folder, User are Entites so that they need to be extended by this class
 * Prepares changed data to send to the cloud
 */

class Syncable {

  /**
   * @constructor
   */
  constructor() { }

  /**
   * Get from queue updated Entities
   * @return {Promise.<void>}
   */
  static async prepareUpdates() {

    /** Here we getting Entity Ids from Queue */
    let syncingData = await global.app.syncQueueObserver.getEntityQueue( this.syncModelType );

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
}

module.exports = Syncable;
