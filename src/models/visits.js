/**
 * Created by khaydarovm on 27.02.2018.
 */
'use strict';
const db = require('../utils/database'),
    Time = require('../utils/time');

class Visits {

    constructor() {
        this.visitedNotes = {};
    }

    /**
     * sync visits
     * @return {Promise.<*>}
     */
    async syncVisits() {
        let allNotes = await db.find(db.VISITS, {});
        allNotes.forEach( (note) => {
            this.visitedNotes[note.noteId] = note.lastSeen;
        });
    }

    async getNoteVisit(noteId) {
        return await db.findOne(db.VISITS, {
            noteId : noteId
        });
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

module.exports = Visits;