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
  let Folder = require('./folders').default;
  let Autoresizer = require('./autoresizer').default;

  new Aside();

  window.ipcRenderer.on('note saved', Note.addToMenu);
  window.NOTE_TITLE = document.getElementById('note-title');
  window.NOTE_DATE = document.getElementById('note-date');

  let autoResizableElements = document.getElementsByClassName('js-autoresizable');
  let note = new Note();

  let autoresizer = new Autoresizer(autoResizableElements);

  note.enableAutosave();

  let currentFolder = document.getElementById('current-folder');

  currentFolder.addEventListener('click', Folder.backToRoot);
};

let openExternalLink = function (event) {
  if (event.target.tagName !== 'A' || !event.target.href) {
    return;
  }

  if (!event.target.closest('.editor')) {
    electron.shell.openExternal(event.target.href);
    return;
  }

  if (event.metaKey || event.ctrlKey) {
    electron.shell.openExternal(event.target.href);
  }
};

/**
 * Application
 */
module.exports = function () {
  document.addEventListener('DOMContentLoaded', documentReady, false);
  document.addEventListener('click', openExternalLink);
  let Note = require('./note').default;
  let Aside = require('./aside').default;

  return {
    Note: Note,
    Aside: Aside
  };
}();
