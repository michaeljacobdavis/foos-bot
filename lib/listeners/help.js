const startListen = require('./start');
const inListen = require('./in');
const stopListen = require('./stop');
const outListen = require('./out');
const winListen = require('./win');
const statsListen = require('./stats');
const statListen = require('./stat');
const rollstatsListen = require('./rollstats');
const fieldListen = require('./field');

exports.matcher = /^!help$/i;
exports.callback = function (route, message, response) {
  response([
    inListen.description,
    outListen.description,
    startListen.description,
    statListen.description,
    statsListen.description,
    rollstatsListen.description,
    stopListen.description,
    winListen.description,
    fieldListen.description
  ].join('\n'));
};
