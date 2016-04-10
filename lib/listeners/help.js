const startListen = require('./start');
const inListen = require('./in');
const stopListen = require('./stop');
const outListen = require('./out');
const winListen = require('./win');

exports.matcher = /^!help$/i;
exports.callback = function (route, message, response) {
  response([
    startListen.description,
    inListen.description,
    outListen.description,
    stopListen.description,
    winListen.description
  ].join('\n'));
};
