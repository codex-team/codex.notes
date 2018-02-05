const db = require('../utils/database');

class Collaborator {

  constructor(collaboratorData = {}) {
    this.data = collaboratorData;
  }

  async save() {

    let data = this.data;

    delete data._id;

    if (this._id) {
      await db.update(db.COLLABORATORS, {_id: this._id}, {$set: data});
    } else {
      let insertedRow = await db.insert(db.COLLABORATORS, data);

      this._id = insertedRow._id;
    }
  }

  set data({_id, token, email, ownerId, folderId, dtInvited}) {
    this._id = _id || this._id || null;
    this.token = token || this.token || null;
    this.email = email || this.email || null;
    this.ownerId = ownerId || this.ownerId || null;
    this.folderId = folderId || this.folderId || null;
    this.dtInvited = dtInvited || this.dtInvited || null;
  }

  get data() {
    return {
      _id: this._id,
      token: this.token,
      email: this.email,
      ownerId: this.ownerId,
      folderId: this.folderId,
      dtInvited: this.dtInvited
    };
  }

  static async findByEmail(folderId, email) {
    return await db.findOne(db.COLLABORATORS, {folderId, email});
  }

}

module.exports = Collaborator;