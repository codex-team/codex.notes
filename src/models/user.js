'use strict';
const random = require('../utils/random');
const db = require('../utils/database');
const {ipcMain} = require('electron');

/**
 * Model for current user representation.
 */
class User {

  /**
   * User model {
   *  {string} id – unique user ID
   *  {string} google_id – unique user ID passed by Google
   *  {string} name – user name
   *  {string} photo – avatar string URL
   *  {string} token – user's authorization JWT
   *  {string} dt_sync – last synchronization timestamp
   * }
   */
  constructor({id, name, photo, token, google_id} = {}) {
    this.id = id || null;
    this.name = name || null;
    this.photo = photo || null;
    this.token = token || null;
    this.google_id = google_id|| null;
    this.dt_sync = 0;

    ipcMain.on('user - get', (event) => {
      event.returnValue = this;
    });
  }

  /**
   * Initialize current model if user exists, otherwise create a new identity.
   */
  async init() {
    try {
      let user = await this.get();

      if (user) {
        this.id = user._id;
        this.name = user.name;
        this.photo = user.photo;
        this.dt_sync = user.dt_sync;
        this.google_id = user.google_id;
        this.token = user.token;
      } else {
        let insertedRow = await db.insert(db.USER, {
          name: this.name,
          photo: this.photo,
          dt_sync: this.dt_sync,
          google_id: this.google_id,
          token: this.token
        });

        this.id = insertedRow._id;
      }
    } catch (err) {
      console.log('User register error: ', err);
    }
  }

    /**
     * Update user's data
     *
     * @param {String} id
     * @param {String} name
     * @param {String} photo
     * @param {String} token
     * @param {String} google_id
     * @returns {Promise.<void>}
     */
  async update({id, name, photo, token, google_id} = {}) {
    this.id = id || this.id;
    this.name = name || this.name;
    this.photo = photo || this.photo;
    this.token = token || this.token;
    this.google_id = google_id || this.google_id;

    let userData = {
      name: this.name,
      photo: this.photo,
      token: this.token,
      google_id: this.google_id,
      dt_sync: this.dt_sync
    };

    /**
     * Using nedb we can't change document's _id.
     * If new id is passed, we should delete old document first
     */
    if (!id) {
      await db.update(db.USER, {}, {
        $set: userData
      });
    } else {
      await db.remove(db.USER, {}, {});

      userData._id = this.id;
      await db.insert(db.USER, userData);
    }
  }

  /**
   * Get current user.
   * @returns {*}
   */
  async get() {
    return await db.findOne(db.USER, {});
  }

  /**
   * Return User's synchronisation date
   * @return {Promise<Number>}
   */
  async getSyncDate() {
    let user = await this.get();

    return user.dt_sync;
  }

  /**
   * Save new synchronisation date
   * @param {Number} newSyncDate
   * @return {Promise<Number>}
   */
  async setSyncDate(newSyncDate) {
    let user = await db.update(db.USER, {}, {
      $set: {
        dt_sync: newSyncDate
      }
    }, {
      returnUpdatedDocs: true
    });

    return user.affectedDocuments;
  }

}

module.exports = User;
