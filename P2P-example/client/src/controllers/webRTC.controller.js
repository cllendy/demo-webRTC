class webRTCController {
  constructor(view, webRTCService) {
    this.view = view;
    this.webRTCService = webRTCService;
    this.view.bindEventsToWebSocket(this.addEventsToWebSocketHandler);
    this.view.bindEventsToWebRTC(this.addEventsToWebRTCHandler);
    this.view.bindAddTrackToWebRTC(this.addTrackToWebRTCHandler);
    this.view.bindStartCall(this.startCallHandler);
    this.view.bindHangUp(this.HangUpConnectionHandler);
    this.webRTCService.bindShowVideocall(this.showVideoCallHandler);
    this.webRTCService.bindhangUpView(this.hangUpViewHandler);
  }

  resetWebRTC = () => {
    this.view.bindEventsToWebRTC(this.addEventsToWebRTCHandler);
    this.view.bindAddTrackToWebRTC(this.addTrackToWebRTCHandler);
  };

  addEventsToWebRTCHandler = remoteVideo => {
    return this.webRTCService.bindEventsToWebRTC(remoteVideo);
  };

  addEventsToWebSocketHandler = username => {
    return this.webRTCService.addEventsToSocket(username);
  };

  addTrackToWebRTCHandler = localStream => {
    return this.webRTCService.addTracks(localStream);
  };

  startCallHandler = otherPerson => {
    return this.webRTCService.bindStartCall(otherPerson);
  };

  showVideoCallHandler = () => {
    return this.view.showVideoCall();
  };

  HangUpConnectionHandler = () => {
    this.resetWebRTC();
    return this.webRTCService.bindHangUpConnection();
  };

  hangUpViewHandler = () => {
    this.resetWebRTC();
    return this.view.hangUpView();
  };
}
