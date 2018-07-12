const $ = require('./dom').default;
const common = require('./utils/common').default;


/**
 * CodeX Editor module
 */
export default class Editor {
  /**
  * @constructor
  * @property {String}  path          - CodeX Editor library path
  * @property {Array}   plugins       - plugins names
  * @property {TimerId} autosaveTimer - autosave debounce timer
  */
  constructor() {
    /**
     * Path to Editor sources dir
     */
    this.path = '../../public/codex.editor/';

    /**
     * List of plugins
     */
    this.plugins = [
      'text'
    ];

    /**
     * List of inline-tools
     */
    this.inlineTools = [
      'term'
    ];

    this.editorZoneId = 'codex-editor';

    this.autosaveTimer = null;

    this.instance = null;

    this.loadEditor()
      .then(() => this.loadPlugins())
      .then(() => this.init());

    // this.loadPlugins()
    //   .then(() => this.init());
  }



  /**
   * Loads CodeX Editor sources
   * @return {Promise}
   */
  loadEditor() {
    return $.loadResource('JS', this.path + 'build/codex-editor.js', 'codex-editor');
  }

  /**
   * Loads CodeX Editor plugins
   * @return {Promise}
   */
  loadPlugins() {
    let pluginsQuery = [];

    this.plugins.forEach( name => {
      pluginsQuery.push(...[
        $.loadResource('JS', this.path + 'example/plugins/' + name + '/' + name + '.js', name),
        $.loadResource('CSS', this.path + 'example/plugins/' + name + '/' + name + '.css', name)
      ]);
    });

    this.inlineTools.forEach( name => {
      pluginsQuery.push(...[
        $.loadResource('JS', this.path + 'example/tools-inline/' + name + '/' + name + '.js', name),
        $.loadResource('CSS', this.path + 'example/tools-inline/' + name + '/' + name + '.css', name)
      ]);
    });

    return Promise.all(pluginsQuery)
      .catch( err => console.warn('Cannot load plugin: ', err))
      .then( () => console.log('Plugins loaded') );
  }

  /**
   * Init CodeX Editor
   * @return {[type]} [description]
   */
  init() {
    // let config = {
    //   holderId : 'codex-editor',
    //   initialBlockPlugin : 'paragraph',
    //   hideToolbar: false,
    //   placeholder: 'Your story',
    //   tools : {}
    // };
    //
    // this.plugins.forEach( name => {
    //   if (!window[name]) {
    //     console.warn('Plugin ' + name + ' does not ready');
    //     return;
    //   }
    //
    //   config.tools[name] = {
    //     type: name,
    //     iconClassname: 'ce-icon-' + name,
    //     render: window[name].render,
    //     validate: window[name].validate,
    //     save: window[name].save,
    //     destroy: window[name].destroy,
    //     makeSettings: window[name].makeSettings,
    //   };
    // });
    //
    // if (config.tools.paragraph) {
    //   config.tools.paragraph.allowedToPaste = true;
    //   config.tools.paragraph.showInlineToolbar = true;
    //   config.tools.paragraph.allowRenderOnPaste = true;
    // }
    //
    // if (config.tools.header) {
    //   config.tools.header.displayInToolbox = true;
    // }

    // codex.editor.start(config);

    this.instance = new CodexEditor({
      holderId : this.editorZoneId,
      initialBlock : 'paragraph',
      placeholder: 'Your story',
      tools: {
        paragraph: Text,
        term: Term
      },
      toolsConfig: {
        paragraph: {
          inlineToolbar : true,
        },
        quote: {
          enableLineBreaks : true
        }
      },
      data: {
        items: [
        ]
      }
    });

    window.editor = this.instance;
    console.log('Editor instance:', window.editor);

    /**
     * Wait some time and init autosave function
     */
    window.setTimeout(() => {
      /**
       * Create a wrapper with debouncing for codex.notes.note.save()
       *
       * @type {Function|*}
       */
      this.saveNoteDebouncedFunction = common.debounce(() => {
        codex.notes.note.save();

        console.log('Saving... 🤪');

        this.instance.saver.save()
          .then(console.log);
      }, 500);

      this.enableAutosave();
    }, 500);
  }

  /**
   * Add keyup listener to editor zone
   */
  enableAutosave() {
    let noteTitle = document.getElementById('note-title'),
        editorZone = document.getElementById(this.editorZoneId);

    noteTitle.addEventListener('keyup', this.saveNoteDebouncedFunction);
    editorZone.addEventListener('keyup', this.saveNoteDebouncedFunction);
  }

  /**
   * Remove keyup listener to editor zone
   */
  disableAutosave() {
    let noteTitle = document.getElementById('note-title'),
        editorZone = document.getElementById(this.editorZoneId);

    noteTitle.removeEventListener('keyup', this.saveNoteDebouncedFunction);
    editorZone.removeEventListener('keyup', this.saveNoteDebouncedFunction);
  }
}
