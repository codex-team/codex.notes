'use strict';

const electron = require('electron');

window.ipcRenderer = electron.ipcRenderer;

/**
 * Disable zoom
 */
electron.webFrame.setZoomLevelLimits(1, 1);

/**
 * Load CSS
 */
require('../stylesheets/base.css');

/**
 * Document ready callback
 */
let documentReady = () => {
  /**
   * Init aside module
   */
  let Aside = require('./aside').default;

  new Aside();

  let Note = require('./note').default;

  let note = new Note();

  note.enableAutosave();
};

/**
 * Application
 */
module.exports = function () {
  document.addEventListener('DOMContentLoaded', documentReady, false);


    /**

    let editor = codex.editor;


    function saveArticle(id) {

        editor.saver.saveBlocks();
        window.setTimeout(sendRequest.bind(null, id), 1000);

    }

    function sendRequest(id) {

        let form = new FormData();

        form.append('json', JSON.stringify( { items: editor.state.jsonOutput } ) );

        if (id) {

            form.append('id', id);

        }

        editor.core.ajax({
            url: '/save',
            data: form,
            type: 'POST',
            success: function () { },
            error: function () { }
        });

    }

    return {
        saveArticle
    };

    */
}();