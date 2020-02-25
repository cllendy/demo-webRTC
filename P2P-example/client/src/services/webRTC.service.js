class WebRTCService {
  constructor() {
    this.webRTC = new RTCPeerConnection({
      iceServers: [
        {
          urls: ['stun:stun.stunprotocol.org']
        }
      ]
    });
    this.handleMessageFactory = {
      start_call: message => this.startCall(message),
      webrtc_ice_candidate: message => this.addICECandidate(message),
      webrtc_offer: message => this.startOffer(message),
      webrtc_answer: message => this.startAnswer(message),
      execute: function(params = {}, action) {
        this[action](params);
      }
    };
    this.otherPerson = '';
    this.socket = new WebSocket(SOCKET_URL);
  }

  async startCall(message) {
    console.log(`receiving call from ${message.with}`);
    this.otherPerson = message.otherPerson;
    this.showVideoCall();

    const offer = await this.webRTC.createOffer();
    await this.webRTC.setLocalDescription(offer);
    this.sendMessageToSignallingServer({
      channel: 'webrtc_offer',
      offer,
      otherPerson: this.otherPerson
    });
  }

  async addICECandidate(message) {
    console.log('received ice candidate');
    await this.webRTC.addIceCandidate(message.candidate);
  }

  async startOffer(message) {
    console.log('received webrtc offer');
    await this.webRTC.setRemoteDescription(message.offer);

    const answer = await this.webRTC.createAnswer();
    await this.webRTC.setLocalDescription(answer);

    this.sendMessageToSignallingServer({
      channel: 'webrtc_answer',
      answer,
      otherPerson: this.otherPerson
    });
  }

  async startAnswer(message) {
    console.log('received webrtc answer');
    await this.webRTC.setRemoteDescription(message.answer);
  }

  handleMessage(message) {
    this.handleMessageFactory.execute(message, message.channel);
  }

  bindEventsToWebRTC(remoteVideo) {
    this.webRTC.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        return;
      }
      this.sendMessageToSignallingServer({
        channel: CHANNELS.WEBRTC_ICE_CANDIDATE,
        candidate: event.candidate,
        otherPerson: this.otherPerson
      });
    });

    this.webRTC.addEventListener('track', event => {
      remoteVideo.srcObject = event.streams[0];
    });

    this.socket.addEventListener('message', event => {
      const message = JSON.parse(event.data.toString());
      this.handleMessage(message);
    });
  }

  addTracks(localStream) {
    for (const track of localStream.getTracks()) {
      this.webRTC.addTrack(track, localStream);
    }
  }

  bindStartCall(otherPerson) {
    this.otherPerson = otherPerson;
    this.sendMessageToSignallingServer({
      channel: 'start_call',
      otherPerson: this.otherPerson
    });
  }

  bindShowVideocall(handler) {
    this.showVideoCall = handler;
  }

  sendMessageToSignallingServer(message) {
    const json = JSON.stringify(message);
    this.socket.send(json);
  }

  addEventsToSocket(username) {
    this.socket.addEventListener('open', () => {
      console.log('websocket connected');
      this.sendMessageToSignallingServer({
        channel: CHANNELS.LOGIN,
        name: username
      });
    });
  }
}
