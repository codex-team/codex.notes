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
      global.logger.debug('Sockets Channel error: ', error);
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
      data = JSON.parse(data);
      this.callback(data.message);
    } catch (error) {
      global.logger.debug('Sockets Channel: unsupported response format. JSON with "message" expected.', error);
    }

  }

  /**
   * Destroys the Channel, terminate Socket connection
   */
  destroy() {
    this.ws.terminate();
    this.name = null;
    this.callback = null;
    this.url = null;
    this.ws = null;
  }
}

module.exports = Sockets;
