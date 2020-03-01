const maxCallers = 3;
let connectCount = 0;
let position = 0;
const list = [];

const loggedInListener = (roomName, callers) => {
  console.log(`Logging in, room name: ${roomName}`);
  easyrtc.setRoomOccupantListener(null);
  for (const callerRTCID in callers) {
    performCall(callerRTCID);
  }
};

window.document.onloadend = initApp();

function initApp() {
  easyrtc.dontAddCloseButtons(true);
  easyrtc.setRoomOccupantListener(loggedInListener);
  easyrtc.easyApp(
    'Company_Chat_Line',
    'self',
    ['caller', 'caller2', 'caller3'],
    myRTCID => {
      console.log(`My RTCID is ${myRTCID}`);
    },
    (errorCode, errorText) => {
      console.log(`Error [${errorCode}]: ${errorText}`);
    }
  );
}

function performCall(callerRTCID) {
  easyrtc.call(
    callerRTCID,
    callerRTCID => console.log('Calling to ' + callerRTCID),
    errorMessage => console.log('Error:' + errorMessage),
    (accepted, bywho) =>
      console.log((accepted ? 'accepted' : 'rejected') + ' by ' + bywho)
  );
}
