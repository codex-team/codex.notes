var electronInstaller = require('electron-winstaller');

let resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: 'release-builds/codex.notes-win32-x64',
  outputDirectory: 'release-builds/win-installer',
  authors: 'CodeX Team',
  exe: 'codex.notes.exe',
  setupExe: 'Installer.exe',
  setupIcon: 'assets/icons/ico/icon-white128.ico'
});

resultPromise.then(() => console.log('It worked!'), (e) => console.log(`No dice: ${e.message}`));
