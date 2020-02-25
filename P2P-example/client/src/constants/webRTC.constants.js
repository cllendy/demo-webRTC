const SOCKET_URL = `wss://${window.location.hostname}:3000/ws`;

const CHANNELS = {
  WEBRTC_ICE_CANDIDATE: 'webrtc_ice_candidate',
  LOGIN: 'login',
  START_CALL: 'start_call',
  WEBRTC_OFFER: 'webrtc_offer',
  WEBRTC_ANSWER: 'webrtc_answer'
};
