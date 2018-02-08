const db = require('../utils/database');
const Time = require('../utils/time');

class Collaborator {

  constructor(collaboratorData = {}) {
    this.data = collaboratorData;
  }

  async save() {
    let data = this.data;

    if (!this._id) {
      delete data._id;
      let insertedRow = await db.insert(db.COLLABORATORS, data);

      this._id = insertedRow._id;

      return;
    }

    let collaboratorFromDB = await db.findOne(db.COLLABORATORS, {_id: this._id});

    if (!collaboratorFromDB) {
      this.data = await db.insert(db.COLLABORATORS, data);
      return;
    }

    delete data._id;
    await db.update(db.COLLABORATORS,
                      {_id: this._id},
                      {$set: data},
                      {returnUpdatedDocs: true});
  }

  set data({_id, token, email, ownerId, folderId, dtInvite}) {
    this._id = _id || this._id || null;
    this.token = token || this.token || null;
    this.email = email || this.email || null;
    this.ownerId = ownerId || this.ownerId || null;
    this.folderId = folderId || this.folderId || null;
    this.dtInvite = dtInvite || this.dtInvite || Time.now;
  }

  get data() {
    return {
      _id: this._id,
      token: this.token,
      email: this.email,
      ownerId: this.ownerId,
      folderId: this.folderId,
      dtInvite: this.dtInvite
    };
  }

  static async findByEmail(folderId, email) {
    return await db.findOne(db.COLLABORATORS, {folderId, email});
  }

  /**
   * Prepare updates for target time
   *
   * @param lastSyncTimestamp
   *
   * @returns {Promise.<Array>}
   */
  static async prepareUpdates(lastSyncTimestamp) {
    let notSyncedItems = await db.find(db.COLLABORATORS, {
      dtInvite: {$gt: lastSyncTimestamp}
    });

    return notSyncedItems;
  }

}

module.exports = Collaborator;