/**
 * Folder Settings panel module
 *
 * @property {Boolean} opened - state
 */
export default class FolderSettings {

  /**
   * @constructor
   */
  constructor() {
    this.toggler = document.getElementById('js-folder-settings-toggler');
    this.closeButton = document.getElementById('js-close-folder');
    this.removeFolderButton = document.getElementById('js-delete-folder');

    this.toggler.addEventListener('click', () => {
      this.toggle();
    });

    this.closeButton.addEventListener('click', () => {
      this.close();
    });

    this.removeFolderButton.addEventListener('click', () => {
      this.removeFolderClicked();
    });
  }

  /**
   * CSS dictionary
   */
  static get CSS() {
    return {
      panelOpenedModifier: 'folder-settings-opened'
    };
  }

  /**
   * Open panel and change state
   */
  open() {
    document.body.classList.add(FolderSettings.CSS.panelOpenedModifier);
    this.opened = true;
  }

  /**
   * Close panel and change state
   */
  close() {
    document.body.classList.remove(FolderSettings.CSS.panelOpenedModifier);
    this.opened = false;
  }

  /**
   * Shows/hide this.panel
   */
  toggle() {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Handler for Remove Folder Button
   */
  removeFolderClicked() {
    console.assert(codex.notes.aside.currentFolder, 'Cannot remove folder because it is not open');

    let result = codex.notes.aside.currentFolder.delete();

    if (result) {
      this.close();
      codex.notes.aside.closeFolder();
    }
  }

}