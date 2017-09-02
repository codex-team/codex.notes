var app =
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
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Aside column module
 */
var Aside = function () {

  /**
  * @constructor
  * @property {object} CSS dictionary
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
    var notesMenu = document.querySelector('[name="js-notes-menu"]');

    /**
     * Show preloader
     */
    notesMenu.classList.add(this.CSS.notesMenuLoading);

    /**
     * Emit message to load list
     */
    window.ipcRenderer.send('load notes list');

    /**
     * Update notes list
     */
    window.ipcRenderer.on('update notes list', function (event, _ref) {
      var notes = _ref.notes;

      notesMenu.classList.remove(_this.CSS.notesMenuLoading);
      notes.forEach(Aside.addMenuItem);
    });

    /**
     * Activate new note button
     */
    var newNoteButton = document.querySelector('[name="js-new-note-button"]');

    newNoteButton.addEventListener('click', function () {
      return _this.newNoteButtonClicked.call(_this);
    });
  }

  /**
   * New note button click handler
   * @this {Aside}
   */


  _createClass(Aside, [{
    key: 'newNoteButtonClicked',
    value: function newNoteButtonClicked() {
      /**
       * Set focus to the Editor
       */
      window.setTimeout(function () {
        var editor = document.querySelector('.ce-redactor');

        editor.click();
      }, 10);
      Note.clear();
    }

    /**
     *
     * Add note to left menu
     *
     * @param {object} noteData
     * @param {string} noteData.title
     */

  }], [{
    key: 'addMenuItem',
    value: function addMenuItem(noteData) {
      /**
       * Maximum chars at the node title
       * @type {Number}
       */
      var titleMaxLength = 68;

      var notesMenu = document.querySelector('[name="js-notes-menu"]');
      var existingNote = notesMenu.querySelector('[data-id="' + noteData.id + '"]');

      var noteTitle = noteData.title;

      if (noteTitle.length > titleMaxLength) {
        noteTitle = noteTitle.substring(0, titleMaxLength) + '…';
      }

      if (existingNote) {
        existingNote.textContent = noteTitle;
        return;
      }

      var menuItem = dom.make('li', null, {
        textContent: noteTitle
      });

      menuItem.dataset.id = noteData.id;

      notesMenu.insertAdjacentElement('afterbegin', menuItem);

      menuItem.addEventListener('click', Aside.menuItemClicked);
    }

    /**
     * Remove item from menu
     *
     * @param itemId
     */

  }, {
    key: 'removeMenuItem',
    value: function removeMenuItem(itemId) {
      var notesMenu = document.querySelector('[name="js-notes-menu"]');

      var existingNote = notesMenu.querySelector('[data-id="' + itemId + '"]');

      if (existingNote) existingNote.remove();
    }

    /**
     * Note in aside menu click listener
     * @this {Element}
     */

  }, {
    key: 'menuItemClicked',
    value: function menuItemClicked() {
      var menuItem = this,
          id = menuItem.dataset.id;

      var noteData = window.ipcRenderer.sendSync('get note', { id: id });

      Note.render(noteData);

      /**
       * Scroll to top
       */
      var editorView = document.querySelector('[name="editor-view"]');

      editorView.scrollIntoView();
    }
  }]);

  return Aside;
}();

exports.default = Aside;


var dom = __webpack_require__(2).default;
var Note = __webpack_require__(1).default;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DELETE_BUTTON_ID = 'delete-button';

/**
 * Note
 */

var Note = function () {
  function Note() {
    _classCallCheck(this, Note);
  }

  _createClass(Note, [{
    key: 'autosave',


    /**
     *  Keyup event on editor zone fires timeout to autosave note
     */
    value: function autosave() {
      if (this.autosaveTimer) window.clearTimeout(this.autosaveTimer);

      this.autosaveTimer = window.setTimeout(Note.save, 200);
    }

    /**
     * Add keyup listener to editor zone
     */

  }, {
    key: 'enableAutosave',
    value: function enableAutosave() {
      codex.editor.nodes.redactor.addEventListener('keyup', this.autosave.bind(this));
      window.NOTE_TITLE.addEventListener('keyup', this.autosave.bind(this));
    }

    /**
     * Remove keyup listener to editor zone
     */

  }, {
    key: 'disableAutosave',
    value: function disableAutosave() {
      codex.editor.nodes.redactor.removeEventListener('keyup', this.autosave.bind(this));
      window.NOTE_TITLE.removeEventListener('keyup', this.autosave.bind(this));
    }

    /**
     *  Add note to menu by Aside.addMenuItem method
     *
     * @param event
     * @param data
     */

  }], [{
    key: 'save',


    /**
     * Send note data to backend
     * @static
     */
    value: function save() {
      dom.get(DELETE_BUTTON_ID).classList.remove('hide');

      try {
        codex.editor.saver.save().then(function (noteData) {
          var note = {
            data: noteData,
            title: window.NOTE_TITLE.value
          };

          window.ipcRenderer.send('save note', { note: note });
        });
      } catch (e) {
        var note = {
          data: { items: [], id: codex.editor.state.blocks.id },
          title: window.NOTE_TITLE.value
        };

        window.ipcRenderer.send('save note', { note: note });
      }
    }
  }, {
    key: 'addToMenu',
    value: function addToMenu(event, _ref) {
      var note = _ref.note;

      codex.editor.state.blocks.id = note.id;

      Aside.addMenuItem(note);
    }

    /**
     * Renders note
     * @param  {object} noteData
     */

  }, {
    key: 'render',
    value: function render(note) {
      codex.editor.content.clear(true);
      window.NOTE_TITLE.value = note.title;
      codex.editor.content.load(note.data);
      dom.get(DELETE_BUTTON_ID).classList.remove('hide');
    }

    /**
     * Clears editor
     */

  }, {
    key: 'clear',
    value: function clear() {
      codex.editor.content.clear(true);
      window.NOTE_TITLE.value = '';
      codex.editor.ui.addInitialBlock();
      dom.get(DELETE_BUTTON_ID).classList.add('hide');
    }

    /**
     * Delete article
     */

  }, {
    key: 'delete',
    value: function _delete() {
      var id = codex.editor.state.blocks.id;

      if (!id) {
        return;
      }

      if (!window.ipcRenderer.sendSync('delete note', { id: id })) {
        return false;
      }

      Note.clear();
      Aside.removeMenuItem(id);
    }
  }]);

  return Note;
}();

exports.default = Note;


var Aside = __webpack_require__(0).default;
var dom = __webpack_require__(2).default;

/***/ }),
/* 2 */
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
    key: "make",

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
    * Replaces node with
    * @param {Element} nodeToReplace
    * @param {Element} replaceWith
    */

  }, {
    key: "replace",
    value: function replace(nodeToReplace, replaceWith) {
      return nodeToReplace.parentNode.replaceChild(replaceWith, nodeToReplace);
    }

    /**
    * getElementById alias
    * @param {String} elementId
    */

  }, {
    key: "get",
    value: function get(elementId) {
      return document.getElementById(elementId);
    }
  }]);

  return DOM;
}();

exports.default = DOM;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("electron");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var electron = __webpack_require__(4);

window.ipcRenderer = electron.ipcRenderer;

/**
 * Disable zoom
 */
electron.webFrame.setZoomLevelLimits(1, 1);

/**
 * Load CSS
 */
__webpack_require__(3);

/**
 * Document ready callback
 */
var documentReady = function documentReady() {
  /**
   * Init aside module
   */
  var Note = __webpack_require__(1).default;
  var Aside = __webpack_require__(0).default;

  new Aside();

  window.ipcRenderer.on('note saved', Note.addToMenu);
  window.NOTE_TITLE = document.getElementById('note-title');

  var note = new Note();

  note.enableAutosave();
};

/**
 * Application
 */
module.exports = function () {
  document.addEventListener('DOMContentLoaded', documentReady, false);
  var Note = __webpack_require__(1).default;
  var Aside = __webpack_require__(0).default;

  return {
    Note: Note,
    Aside: Aside
  };;
}();

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map