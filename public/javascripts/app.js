'use strict';


/**
 * Load libraries
 */
const electron = require('electron');
const Editor = require('./editor').default;
const Aside = require('./aside').default;
const Note = require('./note').default;

import User from './user';

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
  * Initiate modules
  * @type {Aside}
  */
  codex.notes.editor = new Editor();
  codex.notes.aside = new Aside();
  codex.notes.note = new Note();
  codex.notes.user = new User();

  /**
   * New note saving handler
   */
  window.ipcRenderer.on('note saved', (event, response) => {
    console.log('Note saved: ', response);
    codex.notes.note.addToMenu(response);
  });
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
