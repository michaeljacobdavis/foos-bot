const users = require('../models/users');

exports.matcher = /^\!win(?:\sTeam\s|\s)?(.*?)$/i;
exports.callback = function (route, message, response) {
  if (!(message.channel in this.currentGames)) {
    return response('No game in progress. Use `!start` to start a game.');
  }

  if(!route.matches[1] || !(route.matches[1] in this.currentGames[message.channel])) {
    return response('Please provide a valid team. For example `!win Team A`');
  }

  this.currentGames[message.channel]['W'].forEach(id => incrementUserStats(route.matches[1].toUpperCase() === 'W' ? 'wins' : 'losses', id));
  this.currentGames[message.channel]['M'].forEach(id => incrementUserStats(route.matches[1].toUpperCase() === 'M' ? 'wins' : 'losses', id));

  delete this.currentGames[message.channel];

  return response(`Congrats Team ${route.matches[1]}!`);
};


function incrementUserStats (key, id) {
  const chain = users.chain().find({ id });
  if (chain.value()) {
    chain.assign({
      [key]: chain.value()[key] + 1
    }).value();
  } else {
    users.push(Object.assign({
      id,
      wins: 0,
      losses: 0
    }, { [key]: 1 }));
  }
}
