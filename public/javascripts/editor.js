let $ = require('./dom').default;

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
    this.path = '../public/codex.editor/';
    this.plugins = ['paragraph', 'header'];

    this.autosaveTimer = null;

    this.loadEditor()
        .then(() => this.loadPlugins())
        .then(() => this.init());
  }

  /**
   * Loads CodeX Editor sources
   * @return {Promise}
   */
  loadEditor() {
    return Promise.all([
      $.loadResource('JS', this.path + 'codex-editor.js', 'codex-editor'),
      $.loadResource('CSS', this.path + 'codex-editor.css', 'codex-editor')
    ]).catch( err => console.warn('Cannot load Codex Editor sources: ', err))
    .then( () => console.log('CodeX Editor loaded') );
  }

  /**
   * Loads CodeX Editor plugins
   * @return {Promise}
   */
  loadPlugins() {
    let pluginsQuery = [];

    this.plugins.forEach( name => {
      pluginsQuery.push(...[
        $.loadResource('JS', this.path + 'plugins/' + name + '/' + name + '.js', name),
        $.loadResource('CSS', this.path + 'plugins/' + name + '/' + name + '.css', name)
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
    let config = {
      holderId : 'codex-editor',
      initialBlockPlugin : 'paragraph',
      hideToolbar: false,
      placeholder: 'Your story',
      tools : {
        paragraph: {
          allowedToPaste: true,
          showInlineToolbar: true,
          allowRenderOnPaste: true
        },
        header: {
          displayInToolbox: true
        }
      }
    };

    this.plugins.forEach( name => {
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
        makeSettings: window[name].makeSettings,
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

    window.setTimeout(() => {
      this.enableAutosave();
    }, 500);
  }

  /**
   * Keyup event on editor zone fires timeout to autosave note
   */
  autosave() {
    if (this.autosaveTimer) window.clearTimeout(this.autosaveTimer);

    this.autosaveTimer = window.setTimeout(codex.notes.note.save, 500);
  }

  /**
   * Add keyup listener to editor zone
   */
  enableAutosave() {
    codex.editor.nodes.redactor.addEventListener('keyup', this.autosave.bind(this));
  }

  /**
   * Remove keyup listener to editor zone
   */
  disableAutosave() {
    codex.editor.nodes.redactor.removeEventListener('keyup', this.autosave.bind(this));
  }

}
