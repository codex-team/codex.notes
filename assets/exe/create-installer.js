var electronInstaller = require('electron-winstaller');

let resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: 'release-builds/CodeX Notes-win32-x64',
  outputDirectory: 'release-builds/win-installer',
  authors: 'My App Inc.',
  exe: 'CodeX Notes.exe',
  setupExe: 'CodeX Notes Installer',
  setupIcon: 'assets/ico/icon-white128.ico'
});

resultPromise.then(() => console.log('It worked!'), (e) => console.log(`No dice: ${e.message}`));
