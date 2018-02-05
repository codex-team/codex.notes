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
    this.folderTitleInput = document.getElementsByName('folder-title')[0];
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

    this.folderTitleInput.addEventListener('keydown', event => this.changeTitleKeydown(event) );
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


    this.membersList.innerHTML = '';

    let id = codex.notes.aside.currentFolder.id,
        collaborators = window.ipcRenderer.sendSync('folder - get collaborators', {id});

    console.log(collaborators);

    collaborators.forEach(collaborator => {
      this.addCollaborator(collaborator);
    });

    /**
     * Fill Folder's title input
     */
    this.folderTitleInput.value = codex.notes.aside.currentFolder.title || '';
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
    console.assert(codex.notes.aside.currentFolder, 'Cannot remove Folder because it is not open');

    let result = codex.notes.aside.currentFolder.delete();

    if (result) {
      this.close();
      codex.notes.aside.closeFolder();
    }
  }

  /**
   * Handler for Change Title input
   * @param  {KeyboardEvent} event - keydowns
   */
  changeTitleKeydown(event) {
    if (event.key !== 'Enter') {
      return;
    }

    let input = event.target,
        title = input.value.trim(),
        id = codex.notes.aside.currentFolder.id;

    if (!title) {
      return;
    }

    /**
     * Send request for renaming
     * @type {object}
     */
    let result = window.ipcRenderer.sendSync('folder - change title', { id, title });

    if (!result) {
      Dialog.error('Folder renaming failed. Please, try again.');
      return false;
    }

    /**
     * Update title in the:
     *  - folder header
     *  - aside menu
     */
    codex.notes.aside.currentFolder.title = title;

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

    // Clear input field
    input.value = '';

    if (!result.success) {
      Dialog.error(result.message ? result.message : 'Error while adding a collaborator to the folder');
      return false;
    }

    this.addCollaborator({email});
  }

  /**
   *
   * @param collaborator
   */
  addCollaborator(collaborator) {
    // Add item to list of Collaborators
    let newMemberItem = $.make('P', [], {
      innerHTML: collaborator.email
    });

    $.append(this.membersList, newMemberItem);
  }

}
