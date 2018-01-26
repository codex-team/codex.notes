module.exports = function (app) {
  const pkg = require('./../package');

  let info = {
    bugReportUrl: pkg.bugs,
    landingPage: pkg.homepage,
    githubRepo: pkg.repository.url,
    iconPath: __dirname + '/assets/icons/png/icon-white1024.png',
    description: pkg.description,
    name: pkg.productName
  };

  let menuBar = [ {
    label: 'CodeX Notes',
    submenu: [ {
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
    },
    {
      label : 'Log Out',
      click: function() {
        // log out only signed in user
        if (global.user.token) {
          global.app.auth.logOut();
        }
      }
    },
    {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: function () {
        app.quit();
      }
    }
    ]
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
    label: 'View',
    submenu: [ {
      role: 'togglefullscreen'
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
