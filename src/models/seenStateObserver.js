/**
 * @module SeenStateObserver
 * Checks seen notes or makes notes "seen"
 */

'use strict';

const db = require('../utils/database'),
    Time = require('../utils/time');

/**
 * @class SeenStateObserver
 * Class can "touch" note (mark as seen) or get information about visited notes
 *
 * @property this.getSeenNotes {Function} - returns information about passed note
 * @property this.touch {Function} - makes note "seen", sets lastSeen time
 */
class SeenStateObserver {

    constructor() { }

    async getSeenNotes(noteIds) {
        let notes = await db.find(db.VISITS, {
            noteId : {
                $in : noteIds
            }
        });

        let response = {};

        notes.forEach( (note) => {
            response[note.noteId] = note.lastSeen;
        });

        return response;
    }

    async touch(noteId) {

        let query = {
            noteId : noteId
        };

        let data = {
            noteId : noteId,
            lastSeen : Time.now
        };

        await db.update(db.VISITS, query, {
            $set : data
        },{
            upsert : true
        });
    }
}

module.exports = SeenStateObserver;