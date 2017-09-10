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

    this.autoresizer = null;

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
      var autoResizableElements = document.getElementsByClassName('js-autoresizable');

      if (autoResizableElements.length > 0) {
        for (var i = 0; i < autoResizableElements.length; i++) {
          autoResizableElements[i].style.height = 'auto';
        }
      }
      _this.newNoteButtonClicked.call(_this);
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

      var Autoresizer = __webpack_require__(6).default;
      var autoResizableElements = document.getElementsByClassName('js-autoresizable');

      if (this.autoresizer) {
        this.autoresizer.destroy();
        this.autoresizer = null;
      }

      this.autoresizer = new Autoresizer(autoResizableElements);

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

      this.autosaveTimer = window.setTimeout(Note.save, 500);
    }

    /**
     * Add keyup listener to editor zone
     */

  }, {
    key: 'enableAutosave',
    value: function enableAutosave() {
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

      codex.editor.saver.save().then(function (noteData) {
        var note = {
          data: noteData,
          title: window.NOTE_TITLE.value
        };

        var saveIndicator = document.getElementById('save-indicator');

        saveIndicator.classList.add('saved');
        window.setTimeout(function () {
          saveIndicator.classList.remove('saved');
        }, 500);
        window.ipcRenderer.send('save note', { note: note });
      });
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

      var saveDate = new Date(note.data.time);

      window.NOTE_DATE.textContent = saveDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      });
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
      window.NOTE_DATE.textContent = '';
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
  window.NOTE_DATE = document.getElementById('note-date');

  var note = new Note();

  note.enableAutosave();
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
  var Note = __webpack_require__(1).default;
  var Aside = __webpack_require__(0).default;

  return {
    Note: Note,
    Aside: Aside
  };
}();

/***/ }),
/* 6 */
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
      }

      el.addEventListener('keydown', this.enterKeyPressed, false);
      el.addEventListener('input', this.resize.bind(el), false);
    }

    /**
     * handler keypress
     * @param event
     */

  }, {
    key: 'enterKeyPressed',
    value: function enterKeyPressed(event) {
      if (event.keyCode == 13) {
        event.preventDefault();
      }
    }
  }, {
    key: 'resize',


    /**
     * expand height
     * call on element context
     */
    value: function resize() {
      var el = this;

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

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map