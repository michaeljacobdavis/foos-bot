const users = require('../models/users');
const async = require('async');

exports.matcher = /^\!win(?:\sTeam\s|\s)?(.*?)$/i;
exports.callback = function (route, message, response) {
  if (!(message.channel in this.currentGames)) {
    return response('No game in progress. Use `!start` to start a game.');
  }

  if(!route.matches[1] || !(route.matches[1].toUpperCase() in this.currentGames[message.channel])) {
    return response('Please provide a valid team. For example `!win Team A`');
  }

  this.currentGames[message.channel]['W'].forEach(id => incrementUserStats(route.matches[1].toUpperCase() === 'W' ? 'wins' : 'losses', id));
  this.currentGames[message.channel]['M'].forEach(id => incrementUserStats(route.matches[1].toUpperCase() === 'M' ? 'wins' : 'losses', id));

  delete this.currentGames[message.channel];

  response(`Congrats Team ${route.matches[1].toUpperCase()}!`);

  // TODO: Move this out
  const rankings = users.rank().reverse();
  const top = rankings.slice(0, 3);

  async.parallel(top.map(user => callback => this.web.users.info(user.id, callback)), (error, result) => {
    if (error) {
      return console.log(error);
    }

    const leaderboard = result.map((entry, index) => `${index + 1}) ${entry.user ? entry.user.real_name || entry.user.name : entry.error}`);
    this.web.groups.setTopic(message.channel, leaderboard.join('\n'));
    return;
  });


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
