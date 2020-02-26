class webRTCView {
  constructor() {
    this.GUI = {
      remoteVideo: window.document.getElementById('remote-video'),
      localVideo: window.document.getElementById('local-video'),
      callButton: window.document.getElementById('call-button'),
      videoContainer: window.document.getElementById('video-container'),
      buttonAudio: document.getElementById('stopAudio'),
      buttonVideo: document.getElementById('stopVideo')
    };

    this.localStream = null;
    this.localStreamEmited = null;
    this.optionLocalStream = {
      audio: true,
      video: true
    };
    this._addEventVideoSetting();
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
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(localStreamEmited => {
        this.localStreamEmited = localStreamEmited;
        handler(this.localStreamEmited);
      });
    navigator.mediaDevices.getUserMedia({ video: true }).then(localStream => {
      this.localStream = localStream;
      this.GUI.localVideo.srcObject = this.localStream;
    });
  }

  bindStartCall(handler) {
    this.GUI.callButton.addEventListener('click', async () => {
      const otherPerson = prompt('Who you gonna call?');
      this._showVideoCall();
      handler(otherPerson);
    });
  }

  _addEventVideoSetting() {
    this.GUI.buttonVideo.addEventListener('click', this.clickVideoButton);
    this.GUI.buttonAudio.addEventListener('click', this.clickAudioButton);
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

  _toogleOptionCall(option) {
    this.optionLocalStream[option] = !this.optionLocalStream[option];
  }

  clickVideoButton = () => {
    this._toogleOptionCall('video');
    this.GUI.buttonVideo.classList.toggle('on');
    this.localStream.getVideoTracks()[0].enabled = this.optionLocalStream.video;
    this.localStreamEmited.getVideoTracks()[0].enabled = this.optionLocalStream.video;
  };

  clickAudioButton = () => {
    this._toogleOptionCall('audio');
    this.GUI.buttonAudio.classList.toggle('on');
    this.localStreamEmited.getAudioTracks()[0].enabled = this.optionLocalStream.audio;
  };
}
