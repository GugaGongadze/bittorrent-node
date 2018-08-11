'use strict';

const dgram = require('dgram');
const Buffer = require('buffer').Buffer
const urlParse = require('url').parse;                        

const crypto = require('crypto'); 
 
module.exports.getPeers = (torrent, callback) => {
  const socket = dgram.createSocket('udp4');
  const url = torrent.annouce.toString('utf8');

  // send connect request
  updSend(socket, buildConnReq(), url);

  socket.on('message', response => {
    if (respType(response) === 'connect') {
      // receive and parse connect response
      const connResp = parseConnResp(response);

      // send announce request
      announceReq = buildAnnounceReq(connResp.connectionId);
      updSend(socket, announceReq, url);
    } else if (respType(response) === 'announce') {
      // parse announce request
      const announceResp = parseAnnounceResp(response);

      // pass peers to callback
      callback(announceResp.peers)
    }
  });
}

function updSend(socket, message, rawUrl, callback = () => {}) => {
  const url = urlParse(rawUrl);
  socket.send(message, 0, message.length, url.port, url.host, callback);
}

function respType(resp) {
  // ...
}

function buildConnReq() {
  const buf = Buffer.alloc(16);
  
  buf.writeUInt32BE(0x417, 0);
  buf.writeUint32BE(0x27101980, 4);

  buf.writeUInt32BE(0, 8);

  crypto.randomBytes(4).copy(buf, 12);

  return buf;
}

function parseConnResp(resp) {
  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    connectionId: resp.slice(8)
  }
}

function buildAnnounceReq(connId) {
  // ...
}

function parseAnnounceResp(resp) {
  // ...
}


