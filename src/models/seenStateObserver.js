/**
 * Created by khaydarovm on 27.02.2018.
 */
'use strict';
const db = require('../utils/database'),
    Time = require('../utils/time');

class SeenStateObserver {

    constructor() { }

    async getVisits(noteIds) {
        return await db.findOne(db.VISITS, {
            noteId : {
                $in : noteIds
            }
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