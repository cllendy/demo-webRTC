import * as express from 'express';
import * as expressWs from 'express-ws';
import * as WebSocket from 'ws';
import {
  WebSocketMessage,
  WebSocketCallMessage,
  StartCallWebSocketMessage,
  WebRTCIceCandidateWebSocketMessage,
  WebRTCOfferWebSocketMessage,
  WebRTCAnswerWebSocketMessage,
  HangUpWebSocketMessage
} from './messages.interface';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

interface User {
  socket: WebSocket;
  name: string;
}

// we'll keep a list of our connected users, as we need to send them messages later
let connectedUsers: User[] = [];

/**
 * Searches the currently connected users and returns the first one connected to the provided socket.
 * @param socket The socket to search for
 */
function findUserBySocket(socket: WebSocket): User | undefined {
  return connectedUsers.find(user => user.socket === socket);
}

/**
 * Searches the currently connected users and returns the first one with the provided name.
 * @param name The name to search for
 */
function findUserByName(name: string): User | undefined {
  return connectedUsers.find(user => user.name === name);
}

/**
 * Forwards this message to the person
 * @param sender The person originally sending this message
 * @param message The received message
 */
function forwardMessageToOtherPerson(
  sender: User,
  message: WebSocketCallMessage
): void {
  const receiver = findUserByName(message.otherPerson);
  if (!receiver) {
    // in case this user doesn't exist, don't do anything
    return;
  }

  const json = JSON.stringify({
    ...message,
    otherPerson: sender.name
  });

  receiver.socket.send(json);
}

const command: any = {
  login,
  start_call,
  webrtc_ice_candidate,
  webrtc_offer,
  webrtc_answer,
  webrtc_hangUp,
  execute: function(action: string, param: WebSocketCallMessage) {
    this[action](param);
  }
};

/**
 * Processes the incoming message.
 * @param socket The socket that sent the message
 * @param message The message itself
 */
function handleMessage(socket: WebSocket, message: WebSocketMessage): void {
  const sender = findUserBySocket(socket) || {
    name: '[unknown]',
    socket
  };

  const params: any =
    message.channel === 'login'
      ? { socket, name: message.name }
      : { sender, message };

  command.execute(message.channel, params);
}

function login({ socket, name }: { socket: WebSocket; name: string }) {
  console.log(`${name} joined`);
  connectedUsers.push({ socket, name });
}

function start_call({
  sender,
  message
}: {
  sender: User;
  message: StartCallWebSocketMessage;
}) {
  console.log(`${sender.name} started a call with ${message.otherPerson}`);
  forwardMessageToOtherPerson(sender, message);
}

function webrtc_ice_candidate({
  sender,
  message
}: {
  sender: User;
  message: WebRTCIceCandidateWebSocketMessage;
}) {
  console.log(`received ice candidate from ${sender.name}`);
  forwardMessageToOtherPerson(sender, message);
}

function webrtc_offer({
  sender,
  message
}: {
  sender: User;
  message: WebRTCOfferWebSocketMessage;
}) {
  console.log(`received offer from ${sender.name}`);
  forwardMessageToOtherPerson(sender, message);
}
function webrtc_answer({
  sender,
  message
}: {
  sender: User;
  message: WebRTCAnswerWebSocketMessage;
}) {
  console.log(`received answer from ${sender.name}`);
  forwardMessageToOtherPerson(sender, message);
}
function webrtc_hangUp({
  sender,
  message
}: {
  sender: User;
  message: HangUpWebSocketMessage;
}) {
  console.log(`received hang up from ${sender.name} to ${message.otherPerson}`);
  forwardMessageToOtherPerson(sender, message);
}

/**
 * Adds event listeners to the incoming socket.
 * @param socket The incoming WebSocket
 */
function handleSocketConnection(socket: WebSocket): void {
  socket.addEventListener('message', event => {
    // incoming messages are strings of buffers. we need to convert them
    // to objects first using JSON.parse()
    // it's safe to assume we'll only receive valid json here though
    const json = JSON.parse(event.data.toString());
    handleMessage(socket, json);
  });

  socket.addEventListener('close', () => {
    // remove the user from our user list
    connectedUsers = connectedUsers.filter(user => {
      if (user.socket === socket) {
        console.log(`${user.name} disconnected`);
        return false;
      }

      return true;
    });
  });
}

// create an express app, using http `createServer`
const options = {
  key: fs.readFileSync(path.resolve(__dirname, 'key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, 'cert.pem'))
};
const app = express();
const server = https.createServer(options);

//app.use('/', express.static('../../client'));

// add a websocket listener under /ws
const wsApp = expressWs(app, server).app;
wsApp.ws('/ws', handleSocketConnection);

// start the server

server.listen(3000, () => {
  console.log(`server started on https://localhost:${3000}`);
});
