'use strict';
const db = require('../utils/database'),
      fs = require('fs'),
      request = require('request'),
      rp = require('request-promise');

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
   *  {number} dt_sync – last synchronization timestamp
   * }
   *
   * @param {UserData} userData
   */
  constructor(userData = {}) {
    this.data = userData;
  }

  /**
   * Initialize current model if user exists, otherwise create a new identity.
   */
  async init() {
    try {
      let user = await this.get();

      if (user) {
        user.id = user._id;
        this.data = user;
      } else {
        let insertedRow = await db.insert(db.USER, {
          name: this.name,
          photo: this.photo,
          email: this.email,
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
   * @param {UserData} userData
   * @returns {Promise.<void>}
   */
  async update(userData = {}) {
    this.data = userData;

    let dataToInsert = {
      name: this.name,
      photo: this.photo,
      token: this.token,
      email: this.email,
      google_id: this.google_id,
      dt_sync: this.dt_sync
    };

    /**
     * Using nedb we can't change document's _id.
     * If new id is passed, we should delete old document first
     */
    if (!userData.id) {
      await db.update(db.USER, {}, {
        $set: dataToInsert
      });
    } else {
      await db.remove(db.USER, {}, {});

      dataToInsert._id = this.id;
      await db.insert(db.USER, dataToInsert);
    }
  }

  /**
   * Save the avatar on local of user
   */
  async save() {
    let uri = this.photo,
        filename = 'assets/icons/avatars/' + this.name + '.jpeg';

    rp.head(uri)
      .then(request(uri).pipe(fs.createWriteStream(filename)).on('close', function(){
        console.log('File saved');
      }))
      .catch(function(err) {
        console.log('Error: ', err);
      });
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

  /**
   *
   * @typedef {Object} UserData
   * @property {string} id – unique user ID
   * @property {string} google_id – unique user ID passed by Google
   * @property {string} name – user name
   * @property {string} email – user email
   * @property {string} photo – avatar string URL
   * @property {string} token – user's authorization JWT
   * @property {number} dt_sync – user's last synchronization time
   *
   * @param {UserData} userData
   */
  set data(userData) {
      let {id, name, photo, email, token, google_id, dt_sync} = userData;

      this.id = id || this.id || null;
      this.name = name || this.name || null;
      this.photo = photo || this.photo || null;
      this.email = email || this.email || null;
      this.token = token || this.token || null;
      this.google_id = google_id || this.google_id || null;
      this.dt_sync = dt_sync || this.dt_sync || 0;
  }

}

module.exports = User;
