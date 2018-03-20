const db = require('../utils/database');


/**
 * Model that represents db.VISITS
 *
 * @typedef {Visits} Visits
 * @property {string} _id - visit row id
 * @property {string} noteId - Note's id
 * @property {number} lastSeen - time of Note's last open
 */
class Visits {

  /**
   * @constructor
   * @param  {string} noteId
   * @param  {number} lastSeen
   */
  contstuctor({noteId, lastSeen}){
    this._id = null;
    this.noteId = null;
    this.lastSeen = null;
  }

  /**
   * Model data getter
   * @return {{noteId, lastSeen}}
   */
  get data(){
    return {
      noteId: this.noteId,
      lastSeen: this.lastSeen
    }
  }

  /**
   * Upsert a visit
   * @return {Promise<{noteId, lastSeen, _id}[]>} - affected rows
   */
  async save(){
    let query = {
      noteId : noteId
    };

    let dataToSave = {
      $set: this.data
    };

    let options = {
      upsert: true
    };

    let updateResponse = await db.update(db.VISITS, query, dataToSave, options);

    return updateResponse.affectedDocuments;

  }

  /**
   * Return visit times by Note ids
   * @param {number[]} noteIds  - Notes ids
   * @return {{noteId, lastSeen, _id}[]}
   */
  static async findByIds(noteIds){

    let rows = await db.find(db.VISITS, {
      noteId : {
        $in : noteIds
      }
    });

    return rows;
  }
}

module.exports = Visits;