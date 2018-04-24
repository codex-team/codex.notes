'use strict';
const db = require('../utils/database'),
    Time = require('../utils/time'),
    _ = require('../utils/utils'),
    fs = require('fs'),
    request = require('request'),
    path = require('path');

const Syncable = require('./syncable');

/**
 * Model for current user representation.
 * @typedef {User} User
 * @property {string} id – unique user ID
 * @property {string} googleId – unique user ID passed by Google
 * @property {string} name – user name
 * @property {string} photo – avatar string URL
 * @property {string} token – user's authorization JWT
 * @property {number} dt_sync – last synchronization timestamp
 * @property {string} channel – personal sockets channel
 */
class User extends Syncable {

  /**
   * @param {UserData} userData
   */
  constructor(userData = {}) {
    super();

    this.id = null;
    this.name = null;
    this.photo = null;
    this.email = null;
    this.dt_sync = null;
    this.dt_reg = null;
    this.dtModify = null;
    this.googleId = null;
    this.token = null;
    this.channel = null;
    this.localPhoto = path.join(db.appFolder, 'avatar.jpeg');

    this.data = userData;
  }

  /**
   * @return {number}
   */
  static get syncModelType() {
    return 3;
  }

  /**
   * Initialize current model if user exists, otherwise create a new identity.
   */
  async init() {
    try {
      let user = await this.get();

      if (fs.existsSync(this.localPhoto)) {
        this.photo = this.localPhoto;
      }

      if (user) {
        user.id = user._id;
        this.data = user;
      } else {
        let insertedRow = await db.insert(db.USER, {
          name: this.name,
          photo: this.photo,
          email: this.email,
          dt_sync: this.dt_sync,
          dt_reg: this.dt_reg,
          dtModify: this.dtModify,
          googleId: this.googleId,
          token: this.token,
          cahnnel: this.channel
        });

        this.id = insertedRow._id;
      }
    } catch (err) {
      global.logger.debug('User register error: ', err);
    }
  }

  /**
   * Delete user's avatar
   */
  async deleteAvatar() {
    fs.unlink(this.localPhoto, err => {
      global.logger.debug('Failed to remove avatar because ', err);
    });
  }

  /**
   * Update user's data
   *
   * @param {UserData} userData
   * @returns {Promise.<void>}
   */
  async update(userData = {}) {
    try {
      this.data = userData;

      let dataToInsert = {
        name: this.name,
        photo: this.photo,
        token: this.token,
        email: this.email,
        googleId: this.googleId,
        dt_sync: this.dt_sync,
        dt_reg: this.dt_reg,
        dtModify: this.dtModify,
        channel: this.channel
      };

      let currentUser = await this.get();

      /**
       * Using nedb we can't change document's _id.
       * If new id is passed, we should delete old document first
       */
      if (!userData.id) {
        /**
         * Update local data
         */
        let updatedUser = await db.update(db.USER, {}, {
          $set: dataToInsert
        }, {returnUpdatedDocs: true});

        /**
         * Check if we need to update dtModify
         */
        if (!_.equals(updatedUser.affectedDocuments, currentUser)) {
          dataToInsert.dtModify = Time.now;
          await db.update(db.USER, {}, {
            $set: {dtModify: Time.now}
          });
        }
      } else {
        /**
         * We have got a data from Cloud
         * Need to check if we need to update local data
         */
        if (currentUser.dtModify < dataToInsert.dtModify) {
          await db.remove(db.USER, {}, {});

          dataToInsert._id = this.id;
          await db.insert(db.USER, dataToInsert);
        }
      }
    } catch (e) {
      global.logger.debug('Error while updating user data:', e);
    }
  }

  /**
   * Save google photo at the app storage
   */
  async saveAvatar() {
    let uri = this.photo;

    return new Promise((resolve, reject) => {
      request(uri)
        .pipe(fs.createWriteStream(this.localPhoto))
        .on('error', err => {
          reject(err);
        })
        .on('close', () => {
          resolve(this.localPhoto);
        });
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
   * @return {UserData}
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
   * @deprecated
   * Prepare updates for target time
   * @param lastSyncTimestamp
   *
   * @returns {Promise.<Array>}
   */
  static async _prepareUpdates(lastSyncTimestamp) {
    let notSyncedUserModel = await db.findOne(db.USER, {
      dtModify: {$gt: lastSyncTimestamp}
    });

    if (notSyncedUserModel) {
      notSyncedUserModel.id = notSyncedUserModel._id;
    }

    return notSyncedUserModel;
  }

  /**
   * Prepare updates
   * @return {Promise.<void>}
   */
  static async prepareUpdates() {
    return super.prepareUpdates();
  }

  /**
   *
   * @typedef {Object} UserData
   * @property {string} id – unique user ID
   * @property {string} googleId – unique user ID passed by Google
   * @property {string} name – user name
   * @property {string} email – user email
   * @property {string} photo – avatar string URL
   * @property {string} token – user's authorization JWT
   * @property {number} dt_sync – user's last synchronization time
   * @property {string} channel – user's sockets channel
   *
   * @param {UserData} userData
   */
  set data(userData) {
    let {id, name, photo, email, token, googleId, dt_sync, dt_reg, dtModify, channel} = userData;

    this.id = id || this.id || null;
    this.name = name || this.name || null;
    this.photo = photo || this.photo || null;
    this.email = email || this.email || null;
    this.token = token || this.token || null;
    this.googleId = googleId || this.googleId || null;
    this.dt_sync = dt_sync || this.dt_sync || 0;
    this.dt_reg = dt_reg || this.dt_reg || 0;
    this.dtModify = dtModify || this.dtModify || 0;
    this.channel = channel || this.channel || null;
  }

}

module.exports = User;
