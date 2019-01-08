const common = require('./utils/common').default;

/**
 * CodeX Editor core
 */
const CodexEditor = require('codex.editor');

/**
 * Tools for the Editor
 */
const Header = require('codex.editor.header');
const Quote = require('codex.editor.quote');
const Marker = require('codex.editor.marker');
const Code = require('codex.editor.code');
const Delimiter = require('codex.editor.delimiter');
const InlineCode = require('codex.editor.inline-code');
const List = require('codex.editor.list');
const SimpleImage = require('codex.editor.simple-image');
const Table = require('codex.editor.table');
const Checklist = require('codex.editor.checklist');

/**
 * CodeX Editor module
 */
export default class Editor {
  /**
  * @constructor
  */
  constructor() {
    /**
     * Element to be wrapper for an Editor
     */
    this.editorZoneId = 'codex-editor';

    /**
     * Editor's instance
     */
    this.instance = null;

    /**
     * Wrapper with a debounce to save note
     */
    this.saveNoteDebouncedFunction = common.debounce(() => {
      codex.notes.note.save();
    }, 500);

    /**
     * Listen title changes and save note
     */
    let noteTitle = document.getElementById('note-title');

    noteTitle.addEventListener('keyup', this.saveNoteDebouncedFunction);

    /**
     * Start Editor
     */
    this.init();
  }

  /**
   * Init CodeX Editor
   */
  init() {
    this.instance = new CodexEditor({
      holderId : this.editorZoneId,
      tools: {
        /**
         * Block Tools
         */
        header: {
          class: Header,
          inlineToolbar: ['link', 'marker'],
        },
        image: {
          class: SimpleImage,
          inlineToolbar: true,
        },
        list: {
          class: List,
          inlineToolbar: true
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
        },
        code: {
          class: Code,
          shortcut: 'CMD+SHIFT+D'
        },
        table: {
          class: Table,
          inlineToolbar: true
        },
        checklist: {
          class: Checklist,
          inlineToolbar: true
        },
        delimiter: Delimiter,

        /**
         * Inline Tools
         */
        inlineCode: {
          class: InlineCode,
          shortcut: 'CMD+SHIFT+C'
        },
        marker: {
          class: Marker,
          shortcut: 'CMD+SHIFT+M'
        }
      },
      data: {
        items: []
      },

      onChange: this.saveNoteDebouncedFunction,
    });
  }
}
