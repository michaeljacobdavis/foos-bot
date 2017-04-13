const startListen = require('./start');
const inListen = require('./in');
const stopListen = require('./stop');
const outListen = require('./out');
const winListen = require('./win');
const statsListen = require('./stats');
const statListen = require('./stat');
const alltimeListen = require('./alltime');
const fieldListen = require('./field');
const swapListen = require('./swap');
const unofficialListen = require('./unofficial');

exports.matcher = /^!help$/i;
exports.callback = function (route, message, response) {
  response([
    inListen.description,
    outListen.description,
    startListen.description,
    statListen.description,
    statsListen.description,
    alltimeListen.description,
    stopListen.description,
    winListen.description,
    fieldListen.description,
    swapListen.description,
    unofficialListen.description
  ].join('\n'));
};
