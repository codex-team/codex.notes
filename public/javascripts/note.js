let aside = require('./aside').default;

/**
 * @class Note
 */
export default class Note {

  /**
   * @constructor
   */
  constructor() {
    this.saveButton = document.getElementById('save-button');
    codex.editor.nodes.redactor.addEventListener('keyup', this.autosave.bind(this));

    window.ipcRenderer.on('note saved', this.addToMenu);
  }

  /**
   * Send note data to backend
   */
  save() {
    codex.editor.saver.save()
      .then(function (noteData) {
        window.ipcRenderer.send('save note', {noteData});
      });
  }

  /**
   *  Keyup event on editor zone fires timeout to autosave note
   */
  autosave() {
    if (this.autosaveTimer) window.clearTimeout(this.autosaveTimer);

    this.autosaveTimer = window.setTimeout(this.save, 500);
  }

  /**
   *  Add note to menu by Aside.addMenuItem method
   *
   * @param event
   * @param data
   */
  addToMenu(event, {note}) {
    codex.editor.state.blocks.id = note.id;

    aside.addMenuItem(note);
  }

  /**
   * Renders note
   * @param  {object} noteData
   */
  render(noteData) {
    // codex.editor.destroyer.destroy({
    //   ui: true
    // });

    codex.editor.start({
      holderId : 'codex-editor',
      initialBlockPlugin : 'paragraph',
      hideToolbar: false,
      placeholder: 'Your story',
      tools : {
        paragraph: {
          type: 'paragraph',
          iconClassname: 'ce-icon-paragraph',
          render: window.paragraph.render,
          validate: window.paragraph.validate,
          save: window.paragraph.save,
          destroy: window.paragraph.destroy,
          allowedToPaste: true,
          showInlineToolbar: true,
          allowRenderOnPaste: true
        },
        header: {
          type: 'header',
          iconClassname: 'ce-icon-header',
          appendCallback: window.header.appendCallback,
          makeSettings: window.header.makeSettings,
          render: window.header.render,
          validate: window.header.validate,
          save: window.header.save,
          destroy: window.header.destroy,
          displayInToolbox: true
        }
      },
      data: noteData
    });
  }

}