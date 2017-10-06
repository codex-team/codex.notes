'use strict';

const fs = require('fs');
const Datastore = require('nedb');

module.exports = function () {

    let connect = function (path) {

        this.appFolder = path + "/codex.notes/";

        if (!fs.existsSync(this.appFolder)) {
            fs.mkdirSync(this.appFolder);
        }

        this.db = new Datastore({ filename: this.appFolder + 'storage.db', autoload: true });
    };

    return {
        connect: connect
    }

}();