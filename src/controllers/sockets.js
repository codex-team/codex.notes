const WebSocket = require('ws');



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

    let channelULR = 'ws://localhost:8081/chan/' + name;// + '.b10'
    this.ws = new WebSocket(channelULR);

    console.log('trying to listen ' + name);
    this.ws.on('open', () => {
      console.log('listenign channel ' + name);
      // this.ws.send('listenting...');
    });

    this.ws.on('message', (data) => {
    });

  }
}

module.exports = Sockets;