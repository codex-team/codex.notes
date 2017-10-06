'use strict';

const fs = require('fs');
const Datastore = require('nedb');
const osHomedir = require('os-homedir');


module.exports = function () {

    const codexFolder = osHomedir() + '/.codex-notes/';

    let connect = function () {

        if (!fs.existsSync(codexFolder)) {
            fs.mkdirSync(codexFolder);
        }

        this.db = new Datastore({ filename: codexFolder + 'storage.db', autoload: true });
    };

    return {
        connect: connect
    }

}();