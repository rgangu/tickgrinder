//! Functions for interfacing with the platform's Redis-based communication system

import { Modal, Button } from 'antd';

const CONF = require("../conf.js");

/// Creates a big error modal if the MM can't connect to the websocket proxy.
const wsError = () => {
  Modal.error({
    closable: false,
    title: 'Unable to connect to Websocket server!',
    content: 'In order to use this interface, the Redis<->Websocket proxy must be running.  \n\n' +
      'To start it, run.sh in the project root directory and refresh this page.'
  });
}

/// Generates a new V4 UUID in hyphenated form
function v4() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

/// Starts the WS listening for new messages sets up processing callback
function initWs(callback, dispatch) {
  var socketUrl = "ws://localhost:7037";
  var socket = new WebSocket(socketUrl);
  socket.onmessage = message=>{
    callback(dispatch, JSON.parse(message.data));
  };
  socket.onerror = () => {
    wsError();
  }
  return socket;
}

/// Processes a command and returns a Response to send back
function getResponse(command, uuid) {
  let res;
  let action = undefined;
  switch(command) {
    case "Ping":
      var temp = [uuid];
      res = {Pong: {args: temp.splice(2)}};
      break;
    case "Kill":
      res = {Error: {status: "We're client side, we don't take orders from you."}};
      break;
    case "Type":
      res = {Info: {info: "MM"}};
      break;
    default:
      if(command.Ready) {
        res = "Ok";
        action = "instances/instanceSpawned";
      } else {
        res = {Error: {status: "Command not recognized."}};
        break;
      }
  }

  return {res: res, action: action};
}

export default {
  initWs: initWs,
  getResponse: getResponse,
  v4: v4,
}