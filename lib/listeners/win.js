const users = require('../models/users');
const games = require('../models/games');
const async = require('async');

exports.description = '`!win [Team] {name}` - Report a win. Ex. `!win Team W`';
exports.matcher = /^\!win(?:\sTeam\s|\s)?(.*?)$/i;
exports.callback = function (route, message, response) {
  if (!(message.channel in this.currentGames)) {
    return response('No game in progress. Use `!start` to start a game.');
  }

  if(!route.matches[1] || !(route.matches[1].toUpperCase() in this.currentGames[message.channel])) {
    return response('Please provide a valid team. For example `!win Team A`');
  }

  const winningTeam = route.matches[1].toUpperCase();
  saveGame(this.currentGames[message.channel][winningTeam === 'W' ? 'W' : 'M'], this.currentGames[message.channel][winningTeam === 'W' ? 'M' : 'W']);;

  this.currentGames[message.channel]['W'].forEach(id => incrementUserStats(winningTeam === 'W' ? 'wins' : 'losses', id));
  this.currentGames[message.channel]['M'].forEach(id => incrementUserStats(winningTeam === 'M' ? 'wins' : 'losses', id));

  delete this.currentGames[message.channel];

  response(`Congrats Team ${route.matches[1].toUpperCase()}!`);

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

function saveGame(winner, loser) {
  games.push({
    winner,
    loser,
    timestamp: new Date().getTime()
  })
}


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
