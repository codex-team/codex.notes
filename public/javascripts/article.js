/**
 * @class
 */
export default class Article {

  /**
   * @constructor
   */
  constructor() {
    this.saveButton = document.getElementById('save-button');
    setInterval(this.save, 5000);

    window.ipcRenderer.on('article saved', this.addToMenu);
  }

  /**
   *
   */
  save() {
    codex.editor.saver.save()
      .then(function (savedData) {
        window.ipcRenderer.send('save article', JSON.stringify(savedData));
      });
  }

  /**
   *
   * @param event
   * @param data
   */
  addToMenu(event, data) {
    /* TODO: add to menu */
    console.log(data);
  }


}