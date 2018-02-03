const WebSocket = require('ws');



ws.on('open', function open() {
  ws.send('something');
});

ws.on('message', function incoming(data) {
  console.log(data);
});

class Sockets {
  constructor(){
    this.listenedChannels = [];

  }

  /**
   * Starts to listen passed channel
   * @param channel
   */
  listenChannel(channel){
    this.listenedChannels.push(new Channel(channel));
  }
}

class Channel {
  constructor(name){
    this.ws = new WebSocket('ws://www.host.com/path');
  }
}

exports.default = Sockets;