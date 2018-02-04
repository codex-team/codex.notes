var codex = codex || {}; codex["notes"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* DOM manipulations methods
*/
var DOM = function () {
  function DOM() {
    _classCallCheck(this, DOM);
  }

  _createClass(DOM, null, [{
    key: 'make',

    /**
     * Helper for making Elements with classname and attributes
     * @param  {string} tagName           - new Element tag name
     * @param  {array|string} classNames  - list or name of CSS classname(s)
     * @param  {Object} attributes        - any attributes
     * @return {Element}
     */
    value: function make(tagName, classNames, attributes) {
      var el = document.createElement(tagName);

      if (Array.isArray(classNames)) {
        var _el$classList;

        (_el$classList = el.classList).add.apply(_el$classList, _toConsumableArray(classNames));
      } else if (classNames) {
        el.classList.add(classNames);
      }

      for (var attrName in attributes) {
        el[attrName] = attributes[attrName];
      }

      return el;
    }

    /**
     * Append one or several elements to the parent
     *
     * @param  {Element} parent    - where to append
     * @param  {Element|Element[]} - element ore elements list
     */

  }, {
    key: 'append',
    value: function append(parent, elements) {
      if (Array.isArray(elements)) {
        elements.forEach(function (el) {
          return parent.appendChild(el);
        });
      } else {
        parent.appendChild(elements);
      }
    }

    /**
     /**
    * Replaces node with
    * @param {Element} nodeToReplace
    * @param {Element} replaceWith
    */

  }, {
    key: 'replace',
    value: function replace(nodeToReplace, replaceWith) {
      return nodeToReplace.parentNode.replaceChild(replaceWith, nodeToReplace);
    }

    /**
    * getElementById alias
    * @param {String} elementId
    */

  }, {
    key: 'get',
    value: function get(elementId) {
      return document.getElementById(elementId);
    }

    /**
    * Loads static resourse: CSS or JS
    * @param {string} type  - CSS|JS
    * @param {string} path  - resource path
    * @param {string} inctanceName - unique name of resource
    * @return Promise
    */

  }, {
    key: 'loadResource',
    value: function loadResource(type, path, instanceName) {
      /**
       * Imported resource ID prefix
       * @type {String}
       */
      var resourcePrefix = 'cdx-resourse';

      return new Promise(function (resolve, reject) {
        if (!type || !['JS', 'CSS'].includes(type)) {
          reject('Unexpected resource type passed. \xABCSS\xBB or \xABJS\xBB expected, \xAB' + type + '\xBB passed');
        }

        var node = void 0;

        /** Script is already loaded */
        if (!instanceName) {
          reject('Instance name is missed');
        } else if (document.getElementById(resourcePrefix + '-' + type.toLowerCase() + '-' + instanceName)) {
          resolve(path);
        }

        if (type === 'JS') {
          node = document.createElement('script');
          node.async = true;
          node.defer = true;
          node.charset = 'utf-8';
        } else {
          node = document.createElement('link');
          node.rel = 'stylesheet';
        }

        node.id = resourcePrefix + '-' + type.toLowerCase() + '-' + instanceName;

        var timerLabel = 'Resource loading ' + type + ' ' + instanceName;

        console.time(timerLabel);

        node.onload = function () {
          console.timeEnd(timerLabel);
          resolve(path);
        };

        node.onerror = function () {
          console.timeEnd(timerLabel);
          reject(path);
        };

        if (type === 'JS') {
          node.src = path;
        } else {
          node.href = path;
        }

        document.head.appendChild(node);
      });
    }

    /**
     * Inserts one element after another
     * @param  {Element} newNode
     * @param  {Element} referenceNode
     */

  }, {
    key: 'after',
    value: function after(newNode, referenceNode) {
      referenceNode.insertAdjacentElement('afterEnd', newNode);
    }
  }]);

  return DOM;
}();

exports.default = DOM;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var remote = __webpack_require__(3).remote;

/**
 *
 */

var Dialog = function () {

  /**
   *
   */
  function Dialog() {
    _classCallCheck(this, Dialog);
  }

  _createClass(Dialog, null, [{
    key: 'confirm',


    /**
     *
     * @returns {boolean}
     */
    value: function confirm(text) {
      var browserWindow = remote.getCurrentWindow();

      browserWindow.setSheetOffset(30, browserWindow.width / 2);

      var choice = remote.dialog.showMessageBox(browserWindow, {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: text
      });

      if (choice === 0) {
        return true;
      } else {
        return false;
      }
    }

    /**
     * Shows error notification
     *
     * @returns {boolean}
     */

  }, {
    key: 'error',
    value: function error(text) {
      var browserWindow = remote.getCurrentWindow();

      browserWindow.setSheetOffset(30, browserWindow.width / 2);

      remote.dialog.showMessageBox(browserWindow, {
        type: 'error',
        title: 'Wow. Something goes wrong.',
        message: text
      });
    }
  }]);

  return Dialog;
}();

exports.default = Dialog;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = __webpack_require__(0).default;
var AutoResizer = __webpack_require__(12).default;
var Dialog = __webpack_require__(1).default;
<<<<<<< HEAD
var Shortcut = __webpack_require__(18).default;
=======
var Shortcut = __webpack_require__(15).default;
>>>>>>> version2.0

/**
 * @typedef {Object} NoteData
 * @property {String} _id           — Note's id
 * @property {String} title         — Note's title
 * @property {String} authorId      — Note's Author id
 * @property {String} folderId      - Note's Folder id
 * @property {String} content       - JSON with Note's body
 * @property {Number} dtModify      - timestamp of last modification
 * @property {Number} dtCreate      - timestamp of Note creation
 * @property {Boolean} isRemoved    - Note's removed state
 * @property {String|null} editorVersion - used CodeX Editor version
 */

/**
 * Note section module
 *
 * @typedef {Note} Note
 * @property {Element} deleteButton
 * @property {Element} titleEl
 * @property {Element} dateEl
 * @property {Timer} showSavedIndicatorTimer
 * @property {ShortCut[]} shortcut
 */

var Note = function () {

  /**
   * @constructor
   */
  function Note() {
    _classCallCheck(this, Note);

    this.deleteButton = $.get('delete-button');

    this.titleEl = document.getElementById('note-title');
    this.dateEl = document.getElementById('note-date');

    this.showSavedIndicatorTimer = null;

    // when we are creating new note
    if (!this.autoresizedTitle) {
      this.autoresizedTitle = new AutoResizer([this.titleEl]);
    }

    this.shortcuts = [];
  }

  /**
   * Send note data to backend
   * @static
   */


  _createClass(Note, [{
    key: 'save',
    value: function save() {
      var _this = this;

      this.deleteButton.classList.remove('hide');

      /**
       * If folder is opened, pass id. Otherwise pass false
       */
      var folderId = codex.notes.aside.currentFolder ? codex.notes.aside.currentFolder.id : null;

      codex.editor.saver.save().then(function (noteData) {
        _this.validate(noteData);
        return noteData;
      }).then(function (noteData) {
        var note = {
          data: noteData,
          title: _this.titleEl.value.trim(),
          folderId: folderId
        };

        var saveIndicator = document.getElementById('save-indicator');

        if (_this.showSavedIndicatorTimer) {
          window.clearTimeout(_this.showSavedIndicatorTimer);
        }

        saveIndicator.classList.add('saved');

        _this.showSavedIndicatorTimer = window.setTimeout(function () {
          saveIndicator.classList.remove('saved');
        }, 500);

        window.ipcRenderer.send('note - save', { note: note });
      }).catch(function (err) {
        console.log('Error while saving note: ', err);
      });
    }

    /**
     * Validate Note data before saving
     * @param {object} noteData
     * @throws {Error}
     */

  }, {
    key: 'validate',
    value: function validate(noteData) {
      if (!noteData.items.length) {
        throw Error('Article is empty');
      }
    }

    /**
     * Add Note to the menu by Aside.addMenuItem method
     *
     * @param {object} data
     * @param {object} data.note
     * @param {number} data.note.folderId
     * @param {number} data.note._id
     * @param {string} data.note.title
     * @param {Boolean} data.isRootFolder - true if Note included in the Root Folder
     */

  }, {
    key: 'addToMenu',
    value: function addToMenu(_ref) {
      var note = _ref.note,
          isRootFolder = _ref.isRootFolder;

      codex.editor.state.blocks.id = note._id;
      codex.notes.aside.addMenuItem(note, isRootFolder);
    }

    /**
     * Render the Note
     * @param {NoteData} note
     */

  }, {
    key: 'render',
    value: function render(note) {
      codex.editor.content.clear(true);
      this.titleEl.value = note.title;

      /**
       * We store all times in a Seconds to correspond server-format
       * @type {Date}
       */
      var dtModify = new Date(note.dtModify * 1000);

      this.dateEl.textContent = dtModify.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      });
      codex.editor.content.load({
        id: note._id,
        items: JSON.parse(note.content),
        time: note.dtModify,
        version: note.editorVersion
      });
      this.deleteButton.classList.remove('hide');

      /**
       * if we are trying to render new note but we have an Autoresizer instance
       * then we need to clear it before we create new one
       */
      if (this.autoresizedTitle) {
        this.autoresizedTitle.destroy();
      }

      this.autoresizedTitle = new AutoResizer([this.titleEl]);

      /**
       * create new CMD+A shortcut
       * bind it on current rendered Note
       */
      var shortcut = new Shortcut({
        name: 'CMD+A',
        on: codex.editor.nodes.redactor,
        callback: function callback(event) {
          event.preventDefault();
          event.stopImmediatePropagation();

          var range = document.createRange(),
              selection = window.getSelection();

          range.selectNodeContents(codex.editor.nodes.redactor);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      });

      this.shortcuts.push(shortcut);
    }

    /**
     * Clears editor
     */

  }, {
    key: 'clear',
    value: function clear() {
      codex.editor.content.clear(true);
      this.titleEl.value = '';
      this.dateEl.textContent = '';
      codex.editor.ui.addInitialBlock();
      this.deleteButton.classList.add('hide');

      // destroy autoresizer
      this.autoresizedTitle.destroy();

      // destroy all shortcuts on note
      this.shortcuts.forEach(function (shortcut) {
        shortcut.remove();
      });
    }

    /**
     * Set focus to the Editor
     */

  }, {
    key: 'delete',


    /**
     * Delete article
     */
    value: function _delete() {
      var id = codex.editor.state.blocks.id;

      if (!id) {
        return;
      }

      if (Dialog.confirm('Are you sure you want to delete this note?')) {
        if (!window.ipcRenderer.sendSync('note - delete', { id: id })) {
          return false;
        }

        codex.notes.aside.removeMenuItem(id);
        this.clear();
      }
    }

    /**
     * Title input keydowns
     * @description  By ENTER, sets focus on editor
     * @param  {Element} titleElement - title block
     * @param  {Event} event - keydown event
     */

  }, {
    key: 'titleKeydownHandler',
    value: function titleKeydownHandler(titleElement, event) {
      if (event.keyCode == 13) {
        event.preventDefault();

        Note.focusEditor();
      }
    }
  }], [{
    key: 'focusEditor',
    value: function focusEditor() {
      window.setTimeout(function () {
        var editor = document.querySelector('.ce-redactor');

        editor.click();
      }, 10);
    }
  }]);

  return Note;
}();

exports.default = Note;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("electron");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _folder = __webpack_require__(14);

var _folder2 = _interopRequireDefault(_folder);

var _note = __webpack_require__(2);

var _note2 = _interopRequireDefault(_note);

var _folderSettings = __webpack_require__(13);

var _folderSettings2 = _interopRequireDefault(_folderSettings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AsideSwiper = __webpack_require__(11).default;
var $ = __webpack_require__(0).default;

/**
 * Maximum chars at the menu title
 * @type {Number}
 */
var menuItemTitleMaxLength = 68;

/**
 * Aside column module
 *
 * @property {object}          this.CSS                     classnames dictionary
 * @property {AsideSwiper}     this.swiper                  AsideSwiper instance
 * @property {Folder}          this.currentFolder           Opened folder instance
 * @property {Folder}          this.previouslyOpenedFolder  See docs in {@link Aside#constructor}
 * @property {Element}         this.newFolderButton         New folder button
 * @property {Element}         this.newFolderField          New folder form field
 * @property {FolderSettings}  this.folderSettings          Folder Settings Panel instance
 */

var Aside = function () {

  /**
   * @constructor
   */
  function Aside() {
    var _this = this;

    _classCallCheck(this, Aside);

    /**
     * Make CSS dictionary
     * @type {Object}
     */
    this.CSS = {
      notesMenuLoading: 'notes-list--loading'
    };

    /**
     * Find notes list holder
     * @type {Element}
     */
    var notesMenu = document.querySelector('[name="js-notes-menu"]'),
        foldersMenu = document.querySelector('[name="js-folders-menu"]');

    /**
     * Module for hide/show folder sections
     * @type {AsideSwiper}
     */
    this.swiper = new AsideSwiper({
      opened: function opened() {
        return _this.folderOpened();
      },
      closed: function closed() {
        return _this.folderClosed();
      }
    });

    /**
     * Current opened folder.
     * @type {Folder}
     */
    this.currentFolder = null;

    /**
     * Save previously opened folder id.
     * Usecase:
     *   - Folder opened by click in menu (and saved in {@link Aside#currentFolder})
     *   - Folder closed by swipe-left on Aside (this.currentFolder = null)
     *   - User makes swipe-right to open Folder back, but we have not its ID
     *   - So we use previouslyOpenedFolder to construct this.currentFolder again
     */
    this.previouslyOpenedFolder = null;

    /**
     * Show preloader
     */
    notesMenu.classList.add(this.CSS.notesMenuLoading);
    foldersMenu.classList.add(this.CSS.notesMenuLoading);

    /**
     * Emit message to load list
     */
    this.loadNotes();
    this.loadFolders();

    /**
     * Update folder list
     */
    window.ipcRenderer.on('update folders list', function (event, _ref) {
      var userFolders = _ref.userFolders;

      foldersMenu.classList.remove(_this.CSS.notesMenuLoading);
      foldersMenu.innerHTML = '';
      userFolders.forEach(function (folder) {
        return _this.addFolder(folder);
      });
    });

    /**
     * Update notes list
     */
    window.ipcRenderer.on('notes list - update', function (event, _ref2) {
      var notes = _ref2.notes,
          isRootFolder = _ref2.isRootFolder;

      notesMenu.classList.remove(_this.CSS.notesMenuLoading);
      notes.forEach(function (note) {
        return _this.addMenuItem(note, isRootFolder);
      });
    });

    /**
     * Activate new note button
     */
    var newNoteButtons = document.querySelectorAll('[name="js-new-note-button"]');

    newNoteButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        return _this.newNoteButtonClicked(button);
      });
    });

    /**
     * Activate new folder button
     */
    this.newFolderButton = document.querySelector('[name="js-new-folder-button"]');
    this.newFolderField = document.querySelector('[name="js-new-folder-field"]');

    var newFolderInput = this.newFolderField.querySelector('input');

    this.newFolderButton.addEventListener('click', function (event) {
      return _this.newFolderButtonClicked(event);
    });
    newFolderInput.addEventListener('keydown', function (event) {
      return _this.newFolderInputFilled(event);
    });

    /**
     * Activate folders Back button
     */
    var folderCloseToggler = $.get('folder-close-zone');

    folderCloseToggler.addEventListener('click', function () {
      _this.closeFolder();
    });

    this.activateScrollableGradient();

    /**
     * Active 'Folder Settings' panel
     */
    this.folderSettings = new _folderSettings2.default();
  }

  /**
   * Loads notes list from the server
   *
   * Can be used async with subscribtion
   * on window.ipcRenderer.on('notes list - update', (event, {notes, folder}) => {})
   *
   * or synchronously like loadNotes().then( notes => {})
   *
   * @param  {string|null} folderId
   * @returns {<Promise>.[]}
   */


  _createClass(Aside, [{
    key: 'loadNotes',
    value: function loadNotes() {
      var folderId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      return new Promise(function (resolve) {
        var response = window.ipcRenderer.sendSync('notes list - load', folderId);
        /**
         * @var {object} response
         * @var {array}  response.notes
         * @var {object} response.folder
         * @var {number} response.folder.id
         * @var {string} response.folder.title
         * @var {Boolean} response.isRootFolder
         */

        resolve(response);
      }).catch(function (error) {
        console.log('Error while loading notes: ', error);
      });
    }

    /**
     * Loads folders list
     */

  }, {
    key: 'loadFolders',
    value: function loadFolders() {
      window.ipcRenderer.send('folders list - load');
    }

    /**
     * New note button click handler
     * @this {Aside}
     */

  }, {
    key: 'newNoteButtonClicked',
    value: function newNoteButtonClicked() {
      _note2.default.focusEditor();

      codex.notes.note.clear();
    }

    /**
     * New folder button click handler
     * @param {MouseEvent} event
     */

  }, {
    key: 'newFolderButtonClicked',
    value: function newFolderButtonClicked(event) {
      var button = event.target,
          input = this.newFolderField.querySelector('input');

      button.classList.add('hide');
      this.newFolderField.classList.remove('hide');

      input.focus();
    }

    /**
    * New Folder input keydown handler
    * @param {KeyboardEvent} event
    */

  }, {
    key: 'newFolderInputFilled',
    value: function newFolderInputFilled(event) {
      if (event.key !== 'Enter') {
        return;
      }

      var input = event.target,
          folderTitle = input.value.trim();

      if (!folderTitle) {
        return;
      }

      /**
       * Save Folder
       * @type {object}
       */
      var createdFolder = window.ipcRenderer.sendSync('folder - create', folderTitle);

      /**
       * Add saved folder to the menu
       */
      this.addFolder(createdFolder);

      input.value = '';

      this.newFolderField.classList.add('hide');
      this.newFolderButton.classList.remove('hide');
    }

    /**
     *
     * Add a Note to the left menu
     *
     * @param {object} noteData
     * @param {number} noteData._id
     * @param {string} noteData.title
     * @param {number} noteData.folderId
     *
     * @param {Boolean} isRootFolder - true if Note is included to the Root Folder
     */

  }, {
    key: 'addMenuItem',
    value: function addMenuItem(noteData, isRootFolder) {
      var _this2 = this;

      if (!noteData.title) {
        console.warn('Can not add Note to the Aside because it has no title', noteData);
        return;
      }

      var notesMenu = void 0;

      if (isRootFolder) {
        notesMenu = document.querySelector('[name="js-notes-menu"]');
      } else if (this.currentFolder && noteData.folderId === this.currentFolder._id) {
        notesMenu = document.querySelector('[name="js-folder-notes-menu"]');
      } else {
        console.log('Note added to closed folder: %o', noteData.folderId);
        return;
      }

      /**
       * If we already have this item, update title
       */
      var existingNote = notesMenu.querySelector('[data-id="' + noteData._id + '"]');

      if (existingNote) {
        existingNote.textContent = this.createMenuItemTitle(noteData.title);
        return;
      }

      var item = this.makeMenuItem(noteData.title, { id: noteData._id });

      notesMenu.insertAdjacentElement('afterbegin', item);

      item.addEventListener('click', function (event) {
        return _this2.menuItemClicked(event);
      });
    }

    /**
     * Add new item to the folders list
     *
     * @param {object} folder
     * @param {string} folder.title
     * @param {number} folder._id
     */

  }, {
    key: 'addFolder',
    value: function addFolder(folder) {
      var _this3 = this;

      if (!folder.title) {
        console.warn('Can not add Folder to the Aside because it has no title', folder);
        return;
      }
      var foldersMenu = document.querySelector('[name="js-folders-menu"]');
      var item = this.makeMenuItem(folder.title, { folderId: folder._id });

      foldersMenu.insertAdjacentElement('afterbegin', item);

      item.addEventListener('click', function (event) {
        return _this3.folderClicked(event.target);
      });
    }

    /**
     * Makes aside menu item
     * @param  {String} title   - item title
     * @param  {object} dataset - data to store in dataset
     * @return {Element}
     */

  }, {
    key: 'makeMenuItem',
    value: function makeMenuItem(title, dataset) {
      title = this.createMenuItemTitle(title);

      var item = $.make('li', null, {
        textContent: title
      });

      for (var key in dataset) {
        item.dataset[key] = dataset[key];
      }

      return item;
    }

    /**
     * Creates aside menu item title
     * @param {String} title
     * @return {String}
     */

  }, {
    key: 'createMenuItemTitle',
    value: function createMenuItemTitle(title) {
      if (title.length > menuItemTitleMaxLength) {
        title = title.substring(0, menuItemTitleMaxLength) + '…';
      }

      return title;
    }

    /**
     * Remove item from menu
     *
     * @param itemId
     */

  }, {
    key: 'removeMenuItem',
    value: function removeMenuItem(itemId) {
      var notesMenu = document.querySelectorAll('[name="js-notes-menu"], [name="js-folder-notes-menu"]');

      notesMenu.forEach(function (menu) {
        var existingNote = menu.querySelector('[data-id="' + itemId + '"]');

        if (existingNote) existingNote.remove();
      });
    }

    /**
     * Remove folder from menu by ID
     * @param folderId - folder ID
     */

  }, {
    key: 'removeFolderFromMenu',
    value: function removeFolderFromMenu(folderId) {
      var foldersMenu = document.querySelector('[name="js-folders-menu"]');

      if (!foldersMenu) {
        return false;
      }

      var folderItem = foldersMenu.querySelector('[data-folder-id="' + folderId + '"]');

      if (folderItem) {
        folderItem.remove();
      }
    }

    /**
     * Updates Folder's title in menu
     *
     * @param {MongoId} folderId - folder ID
     * @param {String} title     - new title
     */

  }, {
    key: 'updateFolderTitleInMenu',
    value: function updateFolderTitleInMenu(folderId, title) {
      var foldersMenu = document.querySelector('[name="js-folders-menu"]');

      if (!foldersMenu) {
        return false;
      }

      var folderItem = foldersMenu.querySelector('[data-folder-id="' + folderId + '"]');

      if (folderItem) {
        folderItem.textContent = title;
      }
    }

    /**
     * Note in aside menu click listener
     * @param {MouseEvent} event
     */

  }, {
    key: 'menuItemClicked',
    value: function menuItemClicked(event) {
      var menuItem = event.target,
          id = menuItem.dataset.id;

      var noteData = window.ipcRenderer.sendSync('note - get', { id: id });

      codex.notes.note.render(noteData);

      /**
       * Scroll to top
       */
      var editorView = document.querySelector('[name="editor-view"]');

      editorView.scrollIntoView();
    }

    /**
     * Fired after swipe-right
     */

  }, {
    key: 'folderOpened',
    value: function folderOpened() {
      /**
       * Restore current folder after closing
       */
      if (!this.currentFolder && this.previouslyOpenedFolder) {
        this.currentFolder = new _folder2.default(this.previouslyOpenedFolder);
      }

      console.assert(this.currentFolder, 'Folder opened but does not initialized');

      codex.notes.note.clear();
    }

    /**
     * Fired after swipe-left
     */

  }, {
    key: 'folderClosed',
    value: function folderClosed() {
      if (this.currentFolder) {
        this.previouslyOpenedFolder = this.currentFolder.id;
      }

      this.currentFolder = null;
    }

    /**
     * Folder menu item clicked handler
     * @param {Element} item - clicked folder button
     */

  }, {
    key: 'folderClicked',
    value: function folderClicked(item) {
      var folderId = item.dataset.folderId;

      /**
       * Load folder
       */
      this.currentFolder = new _folder2.default(folderId, item.textContent);

      /**
       * Open folder section
       */
      this.swiper.open();
    }

    /**
     * Closes opened folder
     */

  }, {
    key: 'closeFolder',
    value: function closeFolder() {
      this.swiper.close();
    }

    /**
     * Shows fade-out gradient at the top of scrollable zone
     * Uses by scroll to prevent overlaying first block (NOTES, FOLDERS headings) with gradient when block is not scrolled
     */

  }, {
    key: 'activateScrollableGradient',
    value: function activateScrollableGradient() {
      /**
       * Scroll top offset to show gradient
       * @type {Number}
       */
      var minimumDistance = 5;

      /**
       * Modificatior that will be added to the wrapper on scroll
       * @type {String}
       */
      var scrolledModificator = 'aside__scrollable--scrolled';

      /**
       * Scrollable zoners
       * @type {Element[]}
       */
      var scrollableZones = document.querySelectorAll('[name="js-scrollable"]');

      var addClassOnScroll = function addClassOnScroll(event) {
        var scrollableContent = event.target,
            scrollableWrapper = event.target.parentNode;

        if (scrollableContent.scrollTop > minimumDistance) {
          scrollableWrapper.classList.add(scrolledModificator);
        } else {
          scrollableWrapper.classList.remove(scrolledModificator);
        }
      };

      scrollableZones.forEach(function (zone) {
        zone.addEventListener('scroll', addClassOnScroll);
      });
    }
  }]);

  return Aside;
}();

exports.default = Aside;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @module ConnectionObserver
 *
 * Detects Online and Offline statuses and update state in the Aside
 *
 * @typedef {ConnectionObserver} ConnectionObserver
 */
var ConnectionObserver = function () {
  /**
   * @constructor
   */
  function ConnectionObserver() {
    var _this = this;

    _classCallCheck(this, ConnectionObserver);

    if (window.navigator.onLine) {
      this.online();
    } else {
      this.offline();
    }

    window.addEventListener('online', function () {
      _this.online();
    });
    window.addEventListener('offline', function () {
      _this.offline();
    });
  }

  /**
   * Fired when the Application goes Online
   */


  _createClass(ConnectionObserver, [{
    key: 'online',
    value: function online() {
      codex.notes.statusBar.text = 'Syncing';
      codex.notes.statusBar.loading = true;

      this.sync().then(function () {
        codex.notes.statusBar.text = 'All saved';
        codex.notes.statusBar.loading = false;
      });
    }

    /**
     * Send sync event
     * @return {Promise<Object>} - updates from the Cloud
     */

  }, {
    key: 'sync',
    value: function sync() {
      return new Promise(function (resolve) {
        console.time('Syncing...');
        window.ipcRenderer.send('user - sync');
        window.ipcRenderer.once('sync finished', function (event, returnedData) {
          console.timeEnd('Syncing...');
          resolve(returnedData);
        });
      });
    }

    /**
     * Fired when the Application goes Offline
     */

  }, {
    key: 'offline',
    value: function offline() {
      codex.notes.statusBar.text = 'Offline';

      this.reconnect();
    }

    /**
     * Start reconnection process
     */

  }, {
    key: 'reconnect',
    value: function reconnect() {
      codex.notes.statusBar.text = 'Reconnection';
      codex.notes.statusBar.loading = true;
    }
  }]);

  return ConnectionObserver;
}();

exports.default = ConnectionObserver;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = __webpack_require__(0).default;

/**
 * CodeX Editor module
 */

var Editor = function () {

  /**
  * @constructor
  * @property {String}  path          - CodeX Editor library path
  * @property {Array}   plugins       - plugins names
  * @property {TimerId} autosaveTimer - autosave debounce timer
  */
  function Editor() {
    var _this = this;

    _classCallCheck(this, Editor);

    this.path = '../../public/codex.editor/';
    this.plugins = ['paragraph', 'header'];

    this.autosaveTimer = null;

    this.loadEditor().then(function () {
      return _this.loadPlugins();
    }).then(function () {
      return _this.init();
    });
  }

  /**
   * Loads CodeX Editor sources
   * @return {Promise}
   */


  _createClass(Editor, [{
    key: 'loadEditor',
    value: function loadEditor() {
      return Promise.all([$.loadResource('JS', this.path + 'codex-editor.js', 'codex-editor'), $.loadResource('CSS', this.path + 'codex-editor.css', 'codex-editor')]).catch(function (err) {
        return console.warn('Cannot load Codex Editor sources: ', err);
      }).then(function () {
        return console.log('CodeX Editor loaded');
      });
    }

    /**
     * Loads CodeX Editor plugins
     * @return {Promise}
     */

  }, {
    key: 'loadPlugins',
    value: function loadPlugins() {
      var _this2 = this;

      var pluginsQuery = [];

      this.plugins.forEach(function (name) {
        pluginsQuery.push.apply(pluginsQuery, [$.loadResource('JS', _this2.path + 'plugins/' + name + '/' + name + '.js', name), $.loadResource('CSS', _this2.path + 'plugins/' + name + '/' + name + '.css', name)]);
      });

      return Promise.all(pluginsQuery).catch(function (err) {
        return console.warn('Cannot load plugin: ', err);
      }).then(function () {
        return console.log('Plugins loaded');
      });
    }

    /**
     * Init CodeX Editor
     * @return {[type]} [description]
     */

  }, {
    key: 'init',
    value: function init() {
      var _this3 = this;

      var config = {
        holderId: 'codex-editor',
        initialBlockPlugin: 'paragraph',
        hideToolbar: false,
        placeholder: 'Your story',
        tools: {}
      };

      this.plugins.forEach(function (name) {
        if (!window[name]) {
          console.warn('Plugin ' + name + ' does not ready');
          return;
        }

        config.tools[name] = {
          type: name,
          iconClassname: 'ce-icon-' + name,
          render: window[name].render,
          validate: window[name].validate,
          save: window[name].save,
          destroy: window[name].destroy,
          makeSettings: window[name].makeSettings
        };
      });

      if (config.tools.paragraph) {
        config.tools.paragraph.allowedToPaste = true;
        config.tools.paragraph.showInlineToolbar = true;
        config.tools.paragraph.allowRenderOnPaste = true;
      }

      if (config.tools.header) {
        config.tools.header.displayInToolbox = true;
      }

      codex.editor.start(config);

      window.setTimeout(function () {
        _this3.enableAutosave();
      }, 500);
    }

    /**
     * Keyup event on editor zone fires timeout to autosave note
     */

  }, {
    key: 'autosave',
    value: function autosave() {
      if (this.autosaveTimer) window.clearTimeout(this.autosaveTimer);

      this.autosaveTimer = window.setTimeout(function () {
        codex.notes.note.save();
      }, 500);
    }

    /**
     * Add keyup listener to editor zone
     */

  }, {
    key: 'enableAutosave',
    value: function enableAutosave() {
      var noteTitle = document.getElementById('note-title');

      noteTitle.addEventListener('keyup', this.autosave.bind(this));
      codex.editor.nodes.redactor.addEventListener('keyup', this.autosave.bind(this));
    }

    /**
     * Remove keyup listener to editor zone
     */

  }, {
    key: 'disableAutosave',
    value: function disableAutosave() {
      codex.editor.nodes.redactor.removeEventListener('keyup', this.autosave.bind(this));
    }
  }]);

  return Editor;
}();

exports.default = Editor;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dom = __webpack_require__(0);

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @module StatusBar
 * @description Module for working with Aside Status Bar
 *
 * @typedef {StatusBar} StatusBar
 * @property {Element} statusBar - Status Bar Element
 */
var StatusBar = function () {

  /**
   * @constructor
   * Find status bar Element, init all stuff
   */
  function StatusBar() {
    _classCallCheck(this, StatusBar);

    this.statusBar = _dom2.default.get('status-bar');
  }

  /**
   * CSS class names
   */


  _createClass(StatusBar, [{
    key: 'text',


    /**
     * Update text in the Status Bar
     * @param {string} statusText - new text
     */
    set: function set(statusText) {
      var _this = this;

      this.statusBar.textContent = statusText;

      this.statusBar.classList.add(StatusBar.CSS.blinked);
      window.setTimeout(function () {
        _this.statusBar.classList.remove(StatusBar.CSS.blinked);
      }, 400);
    }

    /**
     * Status Bar text getter
     */
    ,
    get: function get() {
      return this.statusBar.textContent;
    }

    /**
     * Set loading state
     * @param {boolean} state - true|false
     */

  }, {
    key: 'loading',
    set: function set(state) {
      this.statusBar.classList.toggle(StatusBar.CSS.loading, state);
    }
  }], [{
    key: 'CSS',
    get: function get() {
      return {
        blinked: 'status-bar--blinked',
        loading: 'status-bar--loading'
      };
    }
  }]);

  return StatusBar;
}();

exports.default = StatusBar;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * DOM helper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _dom = __webpack_require__(0);

var _dom2 = _interopRequireDefault(_dom);

var _dialog = __webpack_require__(1);

var _dialog2 = _interopRequireDefault(_dialog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class       User
 * @classdesc   Authentication methods and user object
 *
 * @typedef {User} User
 * @property {Element} authButton - button 'Login with Google'
 */
var User = function () {

  /**
   * @constructor
   */
  function User() {
    var _this = this;

    _classCallCheck(this, User);

    this.authButton = document.getElementById('js-auth-button');

    var userData = window.ipcRenderer.sendSync('user - get');

    this.fillUserPanel(userData);

    this.authButton.addEventListener('click', function () {
      _this.showAuth();
    });
  }

  /**
   * Opens auth popup
   */


  _createClass(User, [{
    key: 'showAuth',
    value: function showAuth() {
      var authResponse = window.ipcRenderer.sendSync('auth - google auth');

      if (authResponse && authResponse.token) {
        this.fillUserPanel(authResponse);
        window.ipcRenderer.send('user - sync');
      } else {
        _dialog2.default.error('Authentication failed. Please, try again.');
      }
    }

    /**
     * Fills user panel
     * @param  {Object} user
     * @param  {String} user.id
     * @param  {String} user.name
     * @param  {String} user.photo
     */

  }, {
    key: 'fillUserPanel',
    value: function fillUserPanel(user) {
      if (!user.name) return;

      var userPanel = _dom2.default.get('user-panel'),
          photo = _dom2.default.get('user-photo');

      userPanel.classList.add('aside__header-avatar--filled');
      photo.style.backgroundImage = 'url(' + user.photo + ')';
    }
  }]);

  return User;
}();

exports.default = User;

/***/ }),
/* 9 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Load libraries
 */

var _user = __webpack_require__(8);

var _user2 = _interopRequireDefault(_user);

var _statusBar = __webpack_require__(7);

var _statusBar2 = _interopRequireDefault(_statusBar);

var _connectionObserver = __webpack_require__(5);

var _connectionObserver2 = _interopRequireDefault(_connectionObserver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var electron = __webpack_require__(3);
var Editor = __webpack_require__(6).default;

/**
 * Load components
 */
var Aside = __webpack_require__(4).default;
var Note = __webpack_require__(2).default;

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
__webpack_require__(9);

/**
 * Document ready callback
 */
var documentReady = function documentReady() {
  /**
  * Initiate modules
  * @type {Aside}
  */
  codex.notes.editor = new Editor();
  codex.notes.aside = new Aside();
  codex.notes.note = new Note();
  codex.notes.user = new _user2.default();
  codex.notes.statusBar = new _statusBar2.default();
  codex.notes.connectionObserver = new _connectionObserver2.default();

  /**
   * New note saving handler
   */
  window.ipcRenderer.on('note saved', function (event, response) {
    codex.notes.note.addToMenu(response);
  });
};

var openExternalLink = function openExternalLink(event) {
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

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SwipeDetector = __webpack_require__(16).default;

/**
 * Aside swiper class
 * @property {object} CSS dictionary
 */

var AsideSwiper = function () {

  /**
   * @constructor
   * @param {Function} opened  - opening callback
   * @param {Function} closed  - closing callback
   */
  function AsideSwiper(_ref) {
    var _this = this;

    var opened = _ref.opened,
        closed = _ref.closed;

    _classCallCheck(this, AsideSwiper);

    this.CSS = {
      wrapper: 'aside-swiper',
      toggled: 'aside-swiper--toggled',
      left: 'aside-swiper__left',
      right: 'aside-swiper__right'
    };

    this.wrapper = document.querySelector('.' + this.CSS.wrapper);
    this.left = this.wrapper.querySelector('.' + this.CSS.left);
    this.right = this.wrapper.querySelector('.' + this.CSS.right);

    this.opened = opened || function () {};
    this.closed = closed || function () {};

    /**
     * Allow to open/close by two-fingers swipe left/right
     */
    new SwipeDetector(this.wrapper, function (directionRight) {
      if (directionRight) {
        _this.open();
      } else {
        _this.close();
      }
    });
  }

  /**
   * Swipe left menu, shows folder section
   */


  _createClass(AsideSwiper, [{
    key: 'open',
    value: function open() {
      this.wrapper.classList.add(this.CSS.toggled);
      this.opened();
    }

    /**
     * Toggle off folder section
     */

  }, {
    key: 'close',
    value: function close() {
      this.wrapper.classList.remove(this.CSS.toggled);
      this.closed();
    }
  }]);

  return AsideSwiper;
}();

exports.default = AsideSwiper;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Autoresizer module
 * Expands dynamically height of textareas
 */

/**
 * @property elements - array of elements
 * @property {Function} addResizer - adds listeners
 * @property {Function} removeResizer - removes listeners
 * @property {Function} destroy - removes all elements and handlers
 */
var Autoresizer = function () {

  /**
   * adds autoresize handler
   * @param elements - elements that needs to expand
   */
  function Autoresizer(elements) {
    _classCallCheck(this, Autoresizer);

    this.elements = elements || [];

    for (var i = 0; i < this.elements.length; i++) {
      this.addResizer(this.elements[i]);
    }
  }

  /**
   * autoresizer for textareas
   * @param {Element} el - element we want to expand
   */


  _createClass(Autoresizer, [{
    key: 'addResizer',
    value: function addResizer(el) {
      if (el.value.trim()) {
        el.style.height = el.scrollHeight + 'px';
      } else {
        el.style.height = 'auto';
      }

      el.addEventListener('keydown', this.enterKeyPressed, false);
      el.addEventListener('input', this.resize.bind(this, el), false);
    }

    /**
     * Prevent enter key pressing
     * @param event
     */

  }, {
    key: 'enterKeyPressed',
    value: function enterKeyPressed(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
      }
    }

    /**
     * Resize input
     * @param el
     */

  }, {
    key: 'resize',
    value: function resize(el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }

    /**
     * removes handlers from element
     * @param {Element} el - element we want to clear from resizer
     */

  }, {
    key: 'removeResizer',
    value: function removeResizer(el) {
      el.removeEventListener('keydown', this.enterKeyPressed);
      el.removeEventListener('input', this.resize);
    }

    /**
     * Destroyer function. Clears all elements
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      for (var i = 0; i < this.elements.length; i++) {
        this.removeResizer(this.elements[i]);
        this.elements[i].style.height = 'auto';
      }

      this.elements = [];
    }
  }]);

  return Autoresizer;
}();

exports.default = Autoresizer;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Dialog = __webpack_require__(1).default;
var $ = __webpack_require__(0).default;
var Validate = __webpack_require__(17).default;

/**
 * Folder Settings panel module
 *
 * @property {Boolean} opened - state
 */

var FolderSettings = function () {

  /**
   * @constructor
   */
  function FolderSettings() {
    var _this = this;

    _classCallCheck(this, FolderSettings);

    this.toggler = $.get('js-folder-settings-toggler');
    this.closeButton = $.get('js-close-folder');
    this.removeFolderButton = $.get('js-delete-folder');
    this.folderTitleInput = document.getElementsByName('folder-title')[0];
    this.newMemberInput = document.getElementsByName('new-member')[0];
    this.membersList = $.get('js-members-list');

    this.toggler.addEventListener('click', function () {
      _this.toggle();
    });

    this.closeButton.addEventListener('click', function () {
      _this.close();
    });

    this.removeFolderButton.addEventListener('click', function () {
      _this.removeFolderClicked();
    });

    this.folderTitleInput.addEventListener('keydown', function (event) {
      return _this.changeTitleKeydown(event);
    });
    this.newMemberInput.addEventListener('keydown', function (event) {
      return _this.inviteMemberKeydown(event);
    });
  }

  /**
   * CSS dictionary
   */


  _createClass(FolderSettings, [{
    key: 'open',


    /**
     * Open panel and change state
     */
    value: function open() {
      document.body.classList.add(FolderSettings.CSS.panelOpenedModifier);
      this.opened = true;

      /**
       * Fill Folder's title input
       */
      this.folderTitleInput.value = codex.notes.aside.currentFolder.title || '';
    }

    /**
     * Close panel and change state
     */

  }, {
    key: 'close',
    value: function close() {
      document.body.classList.remove(FolderSettings.CSS.panelOpenedModifier);
      this.opened = false;
    }

    /**
     * Shows/hide this.panel
     */

  }, {
    key: 'toggle',
    value: function toggle() {
      if (this.opened) {
        this.close();
      } else {
        this.open();
      }
    }

    /**
     * Handler for Remove Folder Button
     */

  }, {
    key: 'removeFolderClicked',
    value: function removeFolderClicked() {
      console.assert(codex.notes.aside.currentFolder, 'Cannot remove Folder because it is not open');

      var result = codex.notes.aside.currentFolder.delete();

      if (result) {
        this.close();
        codex.notes.aside.closeFolder();
      }
    }

    /**
     * Handler for Change Title input
     * @param  {KeyboardEvent} event - keydowns
     */

  }, {
    key: 'changeTitleKeydown',
    value: function changeTitleKeydown(event) {
      if (event.key !== 'Enter') {
        return;
      }

      var input = event.target,
          title = input.value.trim(),
          id = codex.notes.aside.currentFolder._id;

      if (!title) {
        return;
      }

      /**
       * Send request for renaming
       * @type {object}
       */
      var result = window.ipcRenderer.sendSync('folder - change title', { id: id, title: title });

      if (!result) {
        Dialog.error('Folder renaming failed. Please, try again.');
        return false;
      }

      /**
       * Update title in the:
       *  - folder header
       *  - aside menu
       */
      codex.notes.aside.currentFolder.title = title;

      /**
       * Close folder settings
       */
      this.close();
    }

    /**
     * Handler for New Member input
     * @param {KeyboardEvent} event - keydowns
     */

  }, {
    key: 'inviteMemberKeydown',
    value: function inviteMemberKeydown(event) {
      if (event.key !== 'Enter') {
        return;
      }

      var input = event.target,
          email = input.value.trim(),
          id = codex.notes.aside.currentFolder._id;

      if (!email || !Validate.email(email)) {
        return;
      }

      /**
       * Send request for adding new collaborator
       * @type {object}
       */
      var result = window.ipcRenderer.sendSync('folder - collaborator add', { id: id, email: email });

      if (!result) {
        Dialog.error('Error while adding a collaborator to the folder');
        return false;
      }

      // Clear input field
      input.value = '';

      // Add item to list of Collaborators
      var newMemberItem = $.make('P', [], {
        innerHTML: email
      });

      $.append(this.membersList, newMemberItem);
    }
  }], [{
    key: 'CSS',
    get: function get() {
      return {
        panelOpenedModifier: 'folder-settings-opened'
      };
    }
  }]);

  return FolderSettings;
}();

exports.default = FolderSettings;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var $ = __webpack_require__(0).default;
var Dialog = __webpack_require__(1).default;

/**
 * Folders methods
 *
 * @typedef {Folder} Folder
 * @property {Number}    id                 - Folder's id
 * @property {string}    title              - Folder's title
 * @property {Array}     notes              - Notes list
 * @property {Element}   notesListWrapper   - Notes list holder
 */

var Folder = function () {

  /**
   * Folder methods
   *
   * @param {Number} id     - Folder's id
   * @param {string} title  - Folder's title
   */
  function Folder(id, title) {
    var _this = this;

    _classCallCheck(this, Folder);

    this._id = id;
    this._title = title;

    this.folderTitleElement = $.get('js-folder-title');

    /**
     * Load actual Folder's data
     * @type {Object}
     */
    var folderData = window.ipcRenderer.sendSync('folder - get', this._id);

    this.title = folderData.title;

    codex.notes.aside.loadNotes(id).then(function (_ref) {
      var notes = _ref.notes;

      _this.notes = notes;
    }).then(function () {
      return _this.clearNotesList();
    });

    this.notesListWrapper = document.querySelector('[name="js-folder-notes-menu"]');
  }

  /**
   * Folder id getter
   */


  _createClass(Folder, [{
    key: 'fillHeader',


    /**
     * Fills folder header block
     */
    value: function fillHeader() {
      this.folderTitleElement.textContent = this._title;
    }

    /**
     * Clear list if there is no one note
     */

  }, {
    key: 'clearNotesList',
    value: function clearNotesList() {
      this.notesListWrapper.innerHTML = '';
    }

    /**
     * Delete folder
     */

  }, {
    key: 'delete',
    value: function _delete() {
      if (Dialog.confirm('Are you sure you want to delete this folder?')) {
        if (window.ipcRenderer.sendSync('folder - delete', this._id)) {
          codex.notes.aside.removeFolderFromMenu(this._id);
          codex.notes.note.clear();
          return true;
        }
      }

      Dialog.error('Folder removing failed');
      return false;
    }
  }, {
    key: 'id',
    get: function get() {
      return this._id;
    }

    /**
     * Folder title getter
     */

  }, {
    key: 'title',
    get: function get() {
      return this._title;
    }

    /**
     * Folder title setter
     * @param {String} newTitle
     */
    ,
    set: function set(newTitle) {
      this._title = newTitle;

      /**
       * Update in the Header
       */
      this.fillHeader();

      /**
       * Update in the Aside menu
       */
      codex.notes.aside.updateFolderTitleInMenu(this._id, this._title);
    }
  }]);

  return Folder;
}();

exports.default = Folder;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
<<<<<<< HEAD
 * Two fingers swipe detection class
 */
var SwipeDetector = function () {

  /**
  * @constructor
  *
  * @param {Element} el          - Element to handle swipe
  * @param {Function} callback   - Callback for swipe event. Accepts {Boolean} directionRight parameter
  *
  *
  * @property {Element} el
  * @property {Function} callback
  * @property {Boolean} swiped         -  Flag user to detect horisontal swipe by mousewheel
  * @property {Timer} wheelTimeout     - Timer for detect swipe
  */
  function SwipeDetector(el, callback) {
    var _this = this;

    _classCallCheck(this, SwipeDetector);

    this.el = el;
    this.callback = callback;
    this.swiped = false;
    this.wheelTimeout = null;

    this.el.addEventListener('mousewheel', function (event) {
      _this.detectSwipe(event);
    });
  }

  /**
   * Detects two-fingers swipe and fires callback
   * @fires this.callback
   * @param {WheelEvent} event - mouse wheel
   */


  _createClass(SwipeDetector, [{
    key: 'detectSwipe',
    value: function detectSwipe(event) {
      var _this2 = this;

      /**
       * Detect horisontal scroll
       * @type {Boolean}
       */
      var isHorisontal = event.wheelDeltaY === 0;

      /**
       * Dont fire swipe event on small scrolls
       * @type {Boolean}
       */
      var minimumDistance = 30;
      var swipeEnoughLong = event.wheelDeltaX > minimumDistance || event.wheelDeltaX < -1 * minimumDistance;

      if (isHorisontal && swipeEnoughLong) {
        if (!this.swiped) {
          this.swiped = true;

          /**
           * Pass directionRight parameter. True for right swipe, false for left swipe
           */
          this.callback(event.deltaX > 0);

          this.wheelTimeout = window.setTimeout(function () {
            _this2.swiped = false;
          }, 1000);
        }
      }
    }
  }]);

  return SwipeDetector;
}();

exports.default = SwipeDetector;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Validate module
 */
var Validate = function () {
  function Validate() {
    _classCallCheck(this, Validate);
  }

  _createClass(Validate, null, [{
    key: "email",


    /**
     * Check for email validness
     *
     * @param {string} email
     * @return {boolean}
     */
    value: function email(_email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      return re.test(_email);
    }
  }]);

  return Validate;
}();

exports.default = Validate;

/***/ }),
/* 17 */,
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
=======
>>>>>>> version2.0
 * CodeX Note ShortCuts class
 * Handles keyDowns on Note.
 *
 * Used to create shortcuts on element
 */

/**
 * List of key codes
 */
var keyCodes = {
  '0': 48,
  '1': 49,
  '2': 50,
  '3': 51,
  '4': 52,
  '5': 53,
  '6': 54,
  '7': 55,
  '8': 56,
  '9': 57,
  'A': 65,
  'B': 66,
  'C': 67,
  'D': 68,
  'E': 69,
  'F': 70,
  'G': 71,
  'H': 72,
  'I': 73,
  'J': 74,
  'K': 75,
  'L': 76,
  'M': 77,
  'N': 78,
  'O': 79,
  'P': 80,
  'Q': 81,
  'R': 82,
  'S': 83,
  'T': 84,
  'U': 85,
  'V': 86,
  'W': 87,
  'X': 88,
  'Y': 89,
  'Z': 90,
  'BACKSPACE': 8,
  'ENTER': 13,
  'ESCAPE': 27,
  'LEFT': 37,
  'UP': 38,
  'RIGHT': 39,
  'DOWN': 40,
  'INSERT': 45,
  'DELETE': 46
};

var supportedCommands = {
  'CMD': ['CMD', 'CONTROL', 'COMMAND', 'WINDOWS', 'CTRL'],
  'SHIFT': ['SHIFT'],
  'ALT': ['ALT', 'OPTION']
};

/**
 * @class ShortCuts
 * @classdesc Callback will be fired with two params:
 *   - event: standard keyDown param
 *   - target: element which registered on shortcut creation
 *
 * @typedef {ShortCut} ShortCut
 * @property {String} name - shortcut name
 * @property {Element} on - element that passed on shortcut creation
 * @property {Function} callback - custom user function
 */

var ShortCut = function () {

  /**
   * Create new shortcut
   * @param {ShortCut} shortcut
   * @constructor
   */
  function ShortCut(shortcut) {
    var _this = this;

    _classCallCheck(this, ShortCut);

    this.commands = {};
    this.keys = {};

    this.parseShortcutName(shortcut.name);

    this.element = shortcut.on;
    this.callback = shortcut.callback;

    this.executeShortcut = function (event) {
      _this.execute(event);
    };
    this.element.addEventListener('keydown', this.executeShortcut, false);
  }

  /**
   * parses string to get shortcut commands in uppercase
   * @param {String} shortcut
   *
   * @return {Array} keys
   */


  _createClass(ShortCut, [{
    key: 'parseShortcutName',
    value: function parseShortcutName(shortcut) {
      shortcut = shortcut.split('+');

      for (var key = 0; key < shortcut.length; key++) {
        shortcut[key] = shortcut[key].toUpperCase();

        if (shortcut[key].length > 1) {
          for (var command in supportedCommands) {
            if (supportedCommands[command].includes(shortcut[key])) {
              this.commands[command] = true;
            }
          }
        } else {
          this.keys[shortcut[key]] = true;
        }
      }
    }

    /**
     * Check all passed commands and keys before firing callback
     * @param event
     */

  }, {
    key: 'execute',
    value: function execute(event) {
      var cmdKey = event.ctrlKey || event.metaKey,
          shiftKey = event.shiftKey,
          altKey = event.altKey,
          passed = {
        'CMD': cmdKey,
        'SHIFT': shiftKey,
        'ALT': altKey
      };

      var command = void 0,
          allCommandsPassed = true;

      for (command in this.commands) {
        allCommandsPassed = allCommandsPassed && passed[command];
      }

      var key = void 0,
          allKeysPassed = true;

      for (key in this.keys) {
        allKeysPassed = allKeysPassed && event.keyCode === keyCodes[key];
      }

      if (allCommandsPassed && allKeysPassed) {
        this.callback.call(null, event);
      }
    }

    /**
     * Destroy shortcut: remove listener from element
     */

  }, {
    key: 'remove',
    value: function remove() {
      this.element.removeEventListener('keydown', this.executeShortcut);
    }
  }]);

  return ShortCut;
}();

exports.default = ShortCut;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Two fingers swipe detection class
 */
var SwipeDetector = function () {

  /**
  * @constructor
  *
  * @param {Element} el          - Element to handle swipe
  * @param {Function} callback   - Callback for swipe event. Accepts {Boolean} directionRight parameter
  *
  *
  * @property {Element} el
  * @property {Function} callback
  * @property {Boolean} swiped         -  Flag user to detect horisontal swipe by mousewheel
  * @property {Timer} wheelTimeout     - Timer for detect swipe
  */
  function SwipeDetector(el, callback) {
    var _this = this;

    _classCallCheck(this, SwipeDetector);

    this.el = el;
    this.callback = callback;
    this.swiped = false;
    this.wheelTimeout = null;

    this.el.addEventListener('mousewheel', function (event) {
      _this.detectSwipe(event);
    });
  }

  /**
   * Detects two-fingers swipe and fires callback
   * @fires this.callback
   * @param {WheelEvent} event - mouse wheel
   */


  _createClass(SwipeDetector, [{
    key: 'detectSwipe',
    value: function detectSwipe(event) {
      var _this2 = this;

      /**
       * Detect horisontal scroll
       * @type {Boolean}
       */
      var isHorisontal = event.wheelDeltaY === 0;

      /**
       * Dont fire swipe event on small scrolls
       * @type {Boolean}
       */
      var minimumDistance = 30;
      var swipeEnoughLong = event.wheelDeltaX > minimumDistance || event.wheelDeltaX < -1 * minimumDistance;

      if (isHorisontal && swipeEnoughLong) {
        if (!this.swiped) {
          this.swiped = true;

          /**
           * Pass directionRight parameter. True for right swipe, false for left swipe
           */
          this.callback(event.deltaX > 0);

          this.wheelTimeout = window.setTimeout(function () {
            _this2.swiped = false;
          }, 1000);
        }
      }
    }
  }]);

  return SwipeDetector;
}();

exports.default = SwipeDetector;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Validate module
 */
var Validate = function () {
  function Validate() {
    _classCallCheck(this, Validate);
  }

  _createClass(Validate, null, [{
    key: "email",


    /**
     * Check for email validness
     *
     * @param {string} email
     * @return {boolean}
     */
    value: function email(_email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      return re.test(_email);
    }
  }]);

  return Validate;
}();

exports.default = Validate;

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map