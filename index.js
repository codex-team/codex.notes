let electron = require('electron');

let app = electron.app;
let BrowserWindow = electron.BrowserWindow;

let fs = require('fs');

let backend = require('./bin/www');

let mainWindow;


/**
 * Inter Process Communication - Main proccess
 */
let ipcMain = electron.ipcMain;

app.on('ready', function () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    backgroundColor: '#fff',
    titleBarStyle: 'hiddenInset'
  });

  mainWindow.loadURL('http://localhost:3030');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();


});

// Event handler for asynchronous incoming messages
ipcMain.on('asynchronous-message', (event, arg) => {
   console.log(arg);

   // Event emitter for sending asynchronous messages
   event.sender.send('asynchronous-reply', 'async pong');
});

// Event handler for synchronous incoming messages
ipcMain.on('synchronous-message', (event, arg) => {
   console.log(arg);

   // Synchronous event emmision
   event.returnValue = 'sync pong';
});

ipcMain.on('save article', (event, articleData) => {

  const ARTICLES_DIR = __dirname + '/public/articles';
  articleData = JSON.parse(articleData);

  if (!fs.existsSync(ARTICLES_DIR)) {
    fs.mkdirSync(ARTICLES_DIR);
  }

  if (!articleData.id) {
    articleData.id = +new Date();
  }

  fs.writeFileSync(ARTICLES_DIR + '/' + articleData.id + '.json', JSON.stringify(articleData));

  event.sender.send('article saved', {
    'title': articleData.items[0].data.text,
    'id': articleData.id
  });

});