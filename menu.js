module.exports = function (app) {
  const openAboutWindow = require('about-window').default;

  let info = {
    bugReportUrl: 'https://github.com/codex-team/codex.notes/issues/new',
    landingPage: 'https://ifmo.su/notes',
    githubRepo: 'https://github.com/codex-team/codex.notes',
    iconPath: __dirname + '/assets/icons/png/icon-white1024.png',
    description: 'TODO write description',
    name: 'CodeX Notes'
  };

  let menuBar = [ {
    label: 'CodeX Notes',
    submenu: [ {
      // label: 'About ' + info.name,
      // click: () => openAboutWindow({
      //   icon_path: info.iconPath,
      //   copyright: 'Copyright (c) 2017 CodeX',
      //   bug_report_url: info.bugReportUrl,
      //   homepage: info.landingPage,
      //   description: info.description,
      //   license: 'MIT License'
      // })
      label: 'About ' + info.name,
      role: 'about'
    }, {
      type: 'separator'
    },
    {
      label: 'Hide ' + info.name,
      accelerator: 'Command+H',
      role: 'hide'
    },
    {
      label: 'Hide Others',
      accelerator: 'Command+Shift+H',
      role: 'hideothers'
    },
    {
      label: 'Show All',
      role: 'unhide'
    },
    {
      type: 'separator'
    }, {
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
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
    ]
  }, {
    role: 'help',
    submenu: [ {
      label: 'Report a bug',
      click() {
        require('electron').shell.openExternal(info.bugReportUrl);
      }
    }, {
      type: 'separator'
    }, {
      label: 'Learn more about CodeX Notes',
      click() {
        require('electron').shell.openExternal(info.landingPage);
      }
    } ]
  } ];

  let menuDock = [ {
    role: 'help',
    submenu: [ {
      label: 'Report a bug',
      click() {
        require('electron').shell.openExternal(info.bugReportUrl);
      }
    }, {
      type: 'separator'
    }, {
      label: 'Learn more about CodeX Notes',
      click() {
        require('electron').shell.openExternal(info.landingPage);
      }
    } ]
  } ];

  return {
    menuBar,
    menuDock
  };
};
