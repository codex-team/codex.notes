/**
 * Created by khaydarovm on 27.02.2018.
 */
'use strict';
const db = require('../utils/database'),
    Time = require('../utils/time');

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