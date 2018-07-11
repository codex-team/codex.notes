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

    this.editor = null;

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

    this.editor = new CodexEditor({
      holderId : this.editorZoneId,
      initialBlock : 'text',
      placeholder: 'Your story',
      tools: {
        text: Text,
        term: Term
      },
      toolsConfig: {
        text: {
          inlineToolbar : true,
        },
        quote: {
          enableLineBreaks : true
        }
      },
      data: {
        items: [
          {
            type : 'text',
            data : {
              text : 'Привет от CodeX'
            }
          },
          {
            type : 'text',
            data : {
              text : 'В <b>JavaScript</b> <a href="https://ifmo.su/ts-classes">нет возможности</a> назначить свойства при объявлении класса — все необходимые значения нужно определять в конструкторе или других методах. При таком подходе объявление свойств неявное, не всегда ясно какие свойства имеет класс. TS решает эту проблему: здесь можно не только объявить свойства класса, но и назначить им начальные значения'
            }
          },
          {
            type : 'text',
            data : {
              text : 'Одним из недостатков ES6 классов является невозможность сделать методы и свойства приватными. В TS есть привычные модификаторы: <span class="marked">public</span>, <span class="marked">private</span> и <span class="marked">protected</span>, которые можно использовать как для методов, так и для свойств. По умолчанию, как и в других языках, все свойства имеют модификатор <span class="marked">public</span>.'
            }
          }
        ]
      }
    });

    console.log('Editor instance:', this.editor);

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
        // codex.notes.note.save();

        console.log('Saving... 🤪');

        this.editor.saver.save()
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
