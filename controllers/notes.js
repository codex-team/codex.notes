
let fs = require('fs');
let {ipcMain} = require('electron');
let {dialog} = require('electron');
let sanitizeHtml = require('sanitize-html');

const NOTES_DIR = __dirname + '/../public/notes';
const DEFAULT_TITLE = 'Untitled';





/**
 * Notes List module
 */
ipcMain.on('load notes list', (event, arg) => {
  if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR);
  }

  let noteBlanks = fs.readdirSync(NOTES_DIR);

  let notes = noteBlanks.map( note => {
    let content = fs.readFileSync(NOTES_DIR + '/' + note);
    let json = JSON.parse(content);
    let titleFromText = !!json.data.items.length ? json.data.items[0].data.text : DEFAULT_TITLE;
    let title = json.title ? json.title : false;

    if (!title) {
      title = sanitizeHtml(titleFromText, {allowedTags: []});
    }

    /**
     * Clean all HTML tags from first block to use it as title
     */

    return {
      title,
      id: note.split('.')[0]
    };
  });

  // Event emitter for sending asynchronous messages
  event.sender.send('update notes list', {notes});
});

/**
 * Save note to json file
 */
ipcMain.on('save note', (event, {note}) => {
  if (!note.data.items.length && !note.data.id) return;

  if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR);
  }

  if (!note.data.id) {
    note.data.id = +new Date();
  }

  fs.writeFileSync(NOTES_DIR + '/' + note.data.id + '.json', JSON.stringify(note));


  let titleFromText = !!note.data.items.length ? note.data.items[0].data.text : DEFAULT_TITLE;
  let title = note.title ? note.title : false;

  if (!title) {
    title = sanitizeHtml(titleFromText, {allowedTags: []});
  }


  let menuItem = {
    'title': title,
    'id': note.data.id
  };

  event.sender.send('note saved', {note: menuItem});
});

/**
 * Return note data by id
 * @param {object}
 * @param {number} options.id
 */
ipcMain.on('get note', (event, {id}) => {
  let noteFileData = fs.readFileSync(NOTES_DIR + '/' + id + '.json');

  event.returnValue = JSON.parse(noteFileData);
});

/**
 * Delete note
 */
ipcMain.on('delete note', (event, {id}) => {
  let path = NOTES_DIR + '/' + id + '.json';

  dialog.showMessageBox({
    type: 'question',
    message: 'Do you really want to remove this note?',
    buttons: ['Delete', 'Cancel'],
    icon: __dirname + '/../assets/icons/png/icon-white128.png',
  }, (response) => {
    if (response === 0) {
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
    }
    event.returnValue = !response;
  });
});
