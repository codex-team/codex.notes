const Dialog = require('./dialog').default;
const $ = require('./dom').default;
const Validate = require('./utils/validate').default;

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
    this.toggler = $.get('js-folder-settings-toggler');
    this.closeButton = $.get('js-close-folder');
    this.removeFolderButton = $.get('js-delete-folder');
    this.folderNameInput = document.getElementsByName('folder-name')[0];
    this.newMemberInput = document.getElementsByName('new-member')[0];
    this.membersList = $.get('js-members-list');

    this.toggler.addEventListener('click', () => {
      this.toggle();
    });

    this.closeButton.addEventListener('click', () => {
      this.close();
    });

    this.removeFolderButton.addEventListener('click', () => {
      this.removeFolderClicked();
    });

    this.folderNameInput.addEventListener('keydown', event => this.changeNameKeydown(event) );
    this.newMemberInput.addEventListener('keydown', event => this.inviteMemberKeydown(event) );
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

    /**
     * Fill folder name input
     */
    this.folderNameInput.value = codex.notes.aside.currentFolder.name || '';
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

  /**
   * Handler for Change Name input
   * @param  {KeyboardEvent} event - keydowns
   */
  changeNameKeydown(event) {
    if (event.key !== 'Enter') {
      return;
    }

    let input = event.target,
        name = input.value.trim(),
        id = codex.notes.aside.currentFolder.id;

    if (!name) {
      return;
    }

    /**
     * Send request for renaming
     * @type {object}
     */
    let result = window.ipcRenderer.sendSync('folder - change name', { id, name });

    if (!result) {
      Dialog.error('Folder renaming failed. Please, try again.');
      return false;
    }

    /**
     * Update name in the:
     *  - folder header
     *  - aside menu
     */
    codex.notes.aside.currentFolder.name = name;

    /**
     * Close folder settings
     */
    this.close();
  }

  /**
   * Handler for New Member input
   * @param {KeyboardEvent} event - keydowns
   */
  inviteMemberKeydown(event) {
    if (event.key !== 'Enter') {
      return;
    }

    let input = event.target,
        email = input.value.trim(),
        id = codex.notes.aside.currentFolder.id;

    if (!email || !Validate.email(email)) {
      return;
    }

    /**
     * Send request for adding new collaborator
     * @type {object}
     */
    let result = window.ipcRenderer.sendSync('folder - collaborator add', { id, email });

    if (!result) {
      Dialog.error('Error while adding a collaborator to the folder');
      return false;
    }

    // Clear input field
    input.value = '';

    // Add item to list of Collaborators
    let newMemberItem = document.createElement('P');

    newMemberItem.innerHTML = email;
    this.membersList.appendChild(newMemberItem);
  }

}
