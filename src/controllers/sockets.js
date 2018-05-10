/**
 *  WebSocket implementation.
 * {@link https://github.com/websockets/ws}
 * @type {*|WebSocket}
 */
const WebSocket = require('ws');

/**
 * Communicates with the Cloud by Sockets
 * @typedef {Sockets} Sockets
 * @property {array} channels - list of active channels
 */
class Sockets {
  /**
   * @constructor
   */
  constructor() {
    /**
     * @type {array} - opened channels buffer
     */
    this.channels = [];
  }

  /**
   * Starts to listen passed channel
   * @param {string} channel - Channel's name
   * @param {Function} callback - Messages handler
   */
  listenChannel(channel, callback) {
    this.channels.push(new Channel(channel, callback));
  }

  /**
   * Close connection from passed channel
   * @param {string} channel - Channel's name
   */
  leaveChannel(channel) {
    let openedChannel,
        channelIndex;

    /**
     * Get channel from the buffer by name
     */
    this.channels.forEach( (chan, index) => {
      if (chan.name === channel) {
        openedChannel = chan;
        channelIndex = index;
      }
    });

    if (openedChannel) {
      openedChannel.destroy();
      /**
       * Remove channel from the buffer
       */
      this.channels.splice(channelIndex, 1);
    }
  }
}

/**
 * Socket channel subscription
 * @typedef {Channel} Channel
 * @property {string} name - name of a Channel
 * @property {function} callback - handler for messages. Receive given data as parameter
 * @property {string} url - Channel's URL with host + '/chan/' + name
 * @property {WebSocket} ws - WebSocket instance
 */
class Channel {

  /**
   * Subscribe on a Channel
   * @param {string} name - Channel name
   * @param callback - Message handler
   */
  constructor(name, callback) {
    this.name = name;
    this.callback = callback;
    this.url = process.env.REALTIME_DAEMON + '/chan/' + this.name; // + '.b10'
    this.ws = new WebSocket(this.url, {
      /** Disable a negotiate a compression algorithm {@link https://github.com/websockets/ws#websocket-compression} */
      perMessageDeflate: false
    });

    this.ws.on('open', () => {
      this.opened();
    });

    this.ws.on('close', () => {
      this.closed();
    });

    this.ws.on('message', data => {
      this.onMessage(data);
    });

    this.ws.on('error', (error) => {
      global.logger.debug('Sockets Channel error: %s', error);
    });
  }

  /**
   * Channel opening handler
   */
  opened() {
    global.logger.debug('listening channel ' + this.url);
  }

  /**
   * Channel closing handler
   */
  closed() {
    global.logger.debug('disconnected from ' + this.url);
  }

  /**
   * Given message handler
   * @param {string} data - JSON-answer given. Contain "message" property with data
   */
  onMessage(data) {
    try {
      let parsedData = JSON.parse(data),
          message = parsedData.message,
          deviceId = parsedData['device-id'];

      /**
       * If this is message from yourself then do nothing
       */
      if (deviceId === global.deviceId) {
        return;
      }

      try {
        this.callback(message);
      } catch (error) {
        global.logger.debug('Error while handling socket message: \n%s, \nError: %s', data, error);
      }
    } catch (error) {
      global.logger.debug('Sockets Channel: unsupported response format. JSON with "message" expected. \nError: %s, \nSocket %s', error, data);
    }
  }

  /**
   * Destroys the Channel, terminate Socket connection
   */
  destroy() {
    /**
     * Workaround error "WebSocket is closed before the connection is established"
     * Don't try to close socket if it is not connected yet
     */
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.terminate();
      this.ws = null;
    } else {
      global.logger.debug('Can not destroy channel at the moment, because it is not opened yet. It will be closed immediately after opening.');
      this.ws.once('open', function channelOpened() {
        global.logger.debug('Channel is opened, now we can destroy it');
        this.ws.terminate();
        this.ws = null;
      });
    }

    this.name = null;
    this.callback = null;
    this.url = null;
  }
}

module.exports = Sockets;
