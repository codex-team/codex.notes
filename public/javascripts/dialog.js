const remote = require('electron').remote;

/**
 *
 */
export default class Dialog {
  /**
   *
   */
  constructor() {};

  /**
   *
   * @returns {boolean}
   */
  static confirm(text) {
    const browserWindow = remote.getCurrentWindow();

    browserWindow.setSheetOffset(30, browserWindow.width / 2);

    let choice = remote.dialog.showMessageBox(browserWindow,
      {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: text
      });

    if (choice === 0) {
      return true;
    }    else {
      return false;
    }
  }

  /**
   * Shows error notification
   *
   * @returns {boolean}
   */
  static error(text) {
    const browserWindow = remote.getCurrentWindow();

    browserWindow.setSheetOffset(30, browserWindow.width / 2);

    remote.dialog.showMessageBox(browserWindow, {
      type: 'error',
      title: 'Wow. Something goes wrong.',
      message: text
    });
  }
}