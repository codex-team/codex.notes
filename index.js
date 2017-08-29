let electron = require('electron');

let app = electron.app;
let BrowserWindow = electron.BrowserWindow;

let backend = require('./bin/www');

let mainWindow;

app.on('ready', function () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    backgroundColor: '#fff',
    titleBarStyle: 'hiddenInset'
  });

  mainWindow.loadURL('http://localhost:3030');

})