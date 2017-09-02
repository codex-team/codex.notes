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
  let Note = require('./note').default;
  let Aside = require('./aside').default;

  new Aside();

  window.ipcRenderer.on('note saved', Note.addToMenu);
  window.NOTE_TITLE = document.getElementById('note-title');
  window.NOTE_DATE = document.getElementById('note-date');

  let note = new Note();

  note.enableAutosave();
};

/**
 * Application
 */
module.exports = function () {
  document.addEventListener('DOMContentLoaded', documentReady, false);
  let Note = require('./note').default;
  let Aside = require('./aside').default;

  return {
    Note: Note,
    Aside: Aside
  };;
}();
