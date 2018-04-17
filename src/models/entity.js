/**
 * @module Entity
 * Abstract class for all entities
 *
 * For example Note, Folder, User are Entites so that they need to be extended by this class
 * Prepares changed data to send to the cloud
 */

class Entity {

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
    let entityInfo = await global.app.syncQueueObserver.getEntityQueue( this.EntityType );

    /** Getting Entity models */
    return Promise.all(entityInfo.map( ( entity ) => {
      return this.get( entity.entityId );
    }))
      .then( entities => {

        /** Returning Only Data */
        return entities.map( entity => {
          return entity.data;
        });
      });

  };
}

module.exports = Entity;
