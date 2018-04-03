/**
 * @module SeenStateObserver
 * Manipulates seen-state of Notes
 */

'use strict';

const Time = require('../utils/time');

const Note = require('../models/note');
const Visits = require('../models/visits');

/**
 * @class SeenStateObserver
 * Class can "touch" note (mark as seen) or get information about visited notes
 */
class SeenStateObserver {

  /**
   * @constructor
   */
  constructor() {
  }

  /**
   * Returns visit-date by passed note ids
   *
   * @param {Array} noteIds - list of note ids
   * @return {Promise.<Object>} - {dqO9tu5vY2aSC582: true, ...} - Note Id -> Unread state
   */
  async getNotesUndreadState(noteIds) {
    /**
     * 1. Get visits time for notes that will be opened anytime
     */
    let notesVisited = await Visits.findByIds(noteIds);

    /**
     * 2. Check unread state for passed notes
     *
     * @type {Promise.<{noteId: string, isUnread: boolean}[]>}
     */
    let unreadStates = await Promise.all(notesVisited.map( async ({noteId, lastSeen}) => {
      let note = await Note.get(noteId);

      return {
        noteId: note._id,
        isUnread: note.dtModify > lastSeen // unread: modification time > last visit time
      };
    }));

    /**
     * 3. Compose statuses for all passed ids (not all of them my be opened)
     *
     * @type {{noteId: isUnread}[]}
     */
    let response = {};

    noteIds.forEach( noteId => {
      let noteUnreadState = unreadStates.find(state => state.noteId === noteId),
          isUnread = true;

      if (noteUnreadState) {
        isUnread = noteUnreadState.isUnread;
      }

      response[noteId] = isUnread;
    });


    return response;
  }

  /**
   * Sets new last seen time to mark note as read
   *
   * @param {Number} noteId - note id
   * @return {Promise.<void>}
   */
  async touch(noteId) {

    let visit = new Visits({
      noteId : noteId,
      lastSeen : Time.now
    });

    await visit.save();
  }
}

module.exports = SeenStateObserver;