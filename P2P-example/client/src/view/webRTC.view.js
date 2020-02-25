class webRTCView {
  constructor() {
    this.GUI = {
      remoteVideo: window.document.getElementById('remote-video'),
      localVideo: window.document.getElementById('local-video'),
      callButton: window.document.getElementById('call-button'),
      videoContainer: window.document.getElementById('video-container')
    };
  }

  bindEventsToWebRTC(hanlder) {
    hanlder(this.GUI.remoteVideo);
  }

  bindEventsToWebSocket(hanlder) {
    const username = prompt(
      "What's your name?",
      `user${Math.floor(Math.random() * 100)}`
    );
    this._hideVideoCall();
    hanlder(username);
  }

  bindAddTrackToWebRTC(handler) {
    navigator.mediaDevices.getUserMedia({ video: true }).then(localStream => {
      this.GUI.localVideo.srcObject = localStream;
      handler(localStream);
    });
  }

  bindStartCall(handler) {
    this.GUI.callButton.addEventListener('click', async () => {
      const otherPerson = prompt('Who you gonna call?');
      this._showVideoCall();
      handler(otherPerson);
    });
  }

  _hideVideoCall() {
    this._hideElement(this.GUI.videoContainer);
    this._showElement(this.GUI.callButton);
  }

  showVideoCall = () => {
    return this._showVideoCall();
  };

  _showVideoCall() {
    this._hideElement(this.GUI.callButton);
    this._showElement(this.GUI.videoContainer);
  }

  _hideElement(element) {
    element.style.display = 'none';
  }

  _showElement(element) {
    element.style.display = '';
  }
}
