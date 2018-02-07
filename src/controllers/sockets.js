/**
 *  WebSocket implementation.
 * {@link https://github.com/websockets/ws}
 * @type {*|WebSocket}
 */
const WebSocket = require('ws');

/**
 * Communicates with the Cloud by Sockets
 */
class Sockets {

  /**
   * @constructor
   */
  constructor(){
    this.channels = [];
  }

  /**
   * Starts to listen passed channel
   * @param {string} channel - Channel's name
   * @param {Function} callback - Messages handler
   */
  listenChannel(channel, callback){
    this.channels.push(new Channel(channel, callback));
  }
}

/**
 * Socket channel subscription
 */
class Channel {

  /**
   * Subsribe on a Channel
   * @param {string} name - Channel name
   * @param callback - Message handler
   */
  constructor(name, callback){
    this.name = name;
    this.callback = callback;
    this.url = process.env.REALTIME_DAEMON + this.name; // + '.b10'
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

  }

  opened() {
    console.log('listening channel ' + this.name);
  }

  closed() {
    console.log('disconnected from ' + this.name);
  }

  onMessage(data) {
    this.callback(data);
  }

  destroy(){
    this.name = null;
    this.callback = null;
    this.url = null;
    this.ws.terminate();
    this.ws = null;
  }

}

module.exports = Sockets;