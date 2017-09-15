'use strict';


/**
 * Load libraries
 */
const electron = require('electron');
const Editor = require('./editor').default;
const Aside = require('./aside').default;
const Note = require('./note').default;

/**
 * Save render proccess to the ipdRender global propery
 */
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

  let Folder = require('./folders').default;
  let Autoresizer = require('./autoresizer').default;

  window.ipcRenderer.on('note saved', Note.addToMenu);
  window.NOTE_TITLE = document.getElementById('note-title');
  window.NOTE_DATE = document.getElementById('note-date');

  let autoResizableElements = document.getElementsByClassName('js-autoresizable');

  let autoresizer = new Autoresizer(autoResizableElements);

   /**
   * Initiate modules
   * @type {Aside}
   */
  codex.notes.editor = new Editor();
  codex.notes.aside = new Aside();
  codex.notes.note = new Note();


  let folderHeader = document.getElementById('folder-header');

  folderHeader.addEventListener('click', Folder.backToRoot);
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

  /**
   * Allow access modules with codex.notes[module]
   */
  return {};
}();
