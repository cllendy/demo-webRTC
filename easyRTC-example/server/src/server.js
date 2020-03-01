//Dependencies
const https = require('https');
const fs = require('fs');
const express = require('express');
const socketIo = require('socket.io');
const easyrtc = require('open-easyrtc');

//Prepare server
const app = express();

app.use(express.static('../client/src'));

const webServer = https.createServer(
  {
    key: fs.readFileSync(__dirname + '/certs/localhost.key'),
    cert: fs.readFileSync(__dirname + '/certs/localhost.crt')
  },
  app
);

const socketServer = socketIo.listen(webServer, { 'log level': 1 });

easyrtc.setOption('logLevel', 'debug');

webServer.listen(8080, () => {
  console.log('listening on https://localhost:8080');
});

//Launch server
async function launchServer({ easyrtc, app, socketServer }) {
  const rtcRef = await startEasyRTCserver({ easyrtc, app, socketServer });
  addEventRoomCreate(rtcRef);
  addEventEasyRTCAuth(easyrtc);
  addEventRoomJoin(easyrtc);
}

launchServer({ easyrtc, app, socketServer });

//Main server functions
function startEasyRTCserver({ easyrtc, app, socketServer }) {
  return new Promise((resolve, reject) => {
    easyrtc.listen(app, socketServer, null, (err, rtcRef) => {
      console.log('EasyRTC Server launched');
      resolve(rtcRef);
    });
  });
}

function addEventRoomCreate(rtcRef) {
  rtcRef.events.on(
    'roomCreate',
    (appObj, creatorConnectionObj, roomName, roomOptions, callback) => {
      console.log('Event roomCreate fired, roomName: ' + roomName);
      appObj.events.defaultListeners.roomCreate(
        appObj,
        creatorConnectionObj,
        roomName,
        roomOptions,
        callback
      );
    }
  );
}

function addEventEasyRTCAuth(easyrtc) {
  easyrtc.events.on(
    'easyrtcAuth',
    (socket, easyrtcid, msg, socketCallback, callback) =>
      easyrtc.events.defaultListeners.easyrtcAuth(
        socket,
        easyrtcid,
        msg,
        socketCallback,
        (err, connectionObj) => {
          console.log('Event easyrtcAuth fired, easyrtcid: ' + easyrtcid);

          try {
            connectionObj.setField('credential', msg.msgData.credential, {
              isShared: false
            });
          } catch (error) {
            console.log(error);
          } finally {
            callback(err, connectionObj);
          }
        }
      )
  );
}

function addEventRoomJoin(easyrtc) {
  easyrtc.events.on(
    'roomJoin',
    (connectionObj, roomName, roomParameter, callback) => {
      console.log('Event roomJoin fired, roomName: ' + roomName);
      easyrtc.events.defaultListeners.roomJoin(
        connectionObj,
        roomName,
        roomParameter,
        callback
      );
    }
  );
}
