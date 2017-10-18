var electronInstaller = require('electron-winstaller');

let resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: 'release-builds/CodeX Notes-win32-x64',
  outputDirectory: 'release-builds/win-installer',
  authors: 'CodeX Team',
  exe: 'CodeX Notes.exe',
  setupExe: 'CodeX Notes Installer.exe',
  setupIcon: 'assets/icons/ico/icon-white128.ico'
});

resultPromise.then(() => console.log('It worked!'), (e) => console.log(`No dice: ${e.message}`));
