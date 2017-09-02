module.exports = function (app) {
  let menuTemplate = [ {
    label: 'CodeX Notes',
    submenu: [ {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: function () {
        app.quit();
      }
    } ]
  }, {
    label: 'Edit',
    submenu: [ {
      label: 'Undo',
      accelerator: 'CmdOrCtrl+Z',
      selector: 'undo:'
    }, {
      label: 'Redo',
      accelerator: 'Shift+CmdOrCtrl+Z',
      selector: 'redo:'
    }, {
      type: 'separator'
    }, {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      selector: 'cut:'
    }, {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      selector: 'copy:'
    }, {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      selector: 'paste:'
    }, {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      selector: 'selectAll:'
    } ]
  }, {
    role: 'window',
    submenu: [
    {role: 'minimize'},
    {role: 'close'}
    ]
  }, {
    role: 'help',
    submenu: [ {
      label: 'Report a bug',
      click() {
        require('electron').shell.openExternal('https://github.com/codex-team/codex.notes/issues/new');
      }
    }, {
      type: 'separator'
    }, {
      label: 'Learn more about CodeX Notes',
      click() {
        require('electron').shell.openExternal('https://ifmo.su/notes');
      }
    } ]
  } ];

  return menuTemplate;
};
