/**
 * @module ConnectionObserver
 *
 * Detects Online and Offline statuses and update state in the Aside
 *
 * @typedef {ConnectionObserver} ConnectionObserver
 */
export default class ConnectionObserver {
  /**
   * @constructor
   */
  constructor() {
    if (window.navigator.onLine) {
      this.online();
    } else {
      this.offline();
    }

    window.addEventListener('online',  () => {
      this.online();
    });
    window.addEventListener('offline', () => {
      this.offline();
    });
  }

  /**
   * Fired when the Application goes Online
   */
  online() {
    codex.notes.statusBar.text = 'Syncing';
    codex.notes.statusBar.loading = true;

    this.sync().then(() => {
      codex.notes.statusBar.text = 'All saved';
      codex.notes.statusBar.loading = false;
    });
  }

  /**
   * Send sync event
   * @return {Promise<Object>} - updates from the Cloud
   */
  sync() {
    return new Promise((resolve) => {
      console.time('Syncing...');
      window.ipcRenderer.send('user - sync');
      window.ipcRenderer.once('sync finished', (event, returnedData) => {
        console.timeEnd('Syncing...');
        resolve(returnedData);
      });
    });
  }

  /**
   * Fired when the Application goes Offline
   */
  offline() {
    codex.notes.statusBar.text = 'Offline';

    this.reconnect();
  }

  /**
   * Start reconnection process
   */
  reconnect() {
    codex.notes.statusBar.text = 'Reconnection';
    codex.notes.statusBar.loading = true;
  }
}