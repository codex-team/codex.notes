const WebSocket = require('ws');



class Sockets {
  constructor(){
    this.listenedChannels = [];
  }

  /**
   * Starts to listen passed channel
   * @param channel
   */
  listenChannel(channel, callback){
    this.listenedChannels.push(new Channel(channel, callback));
  }
}

class Channel {
  constructor(name, callback){

    this.name = name;
    this.callback = callback;
    this.url = 'ws://localhost:8081/chan/' + this.name;// + '.b10'
    this.ws = new WebSocket(this.url, {
      /** Disable a negotiate a compression algorithm {@link https://github.com/websockets/ws#websocket-compression} */
      perMessageDeflate: false
    });

    console.log('trying to listen ' + this.name);

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

  opened(){
    console.log('listening channel ' + this.name);
  }

  closed(){
    console.log('disconnected from ' + this.name);
  }

  onMessage(data){
    this.callback(data);
  }

}

module.exports = Sockets;