const usersStore = require('../stores/users');
const gamesStore = require('../stores/games');
const _ = require('lodash');
const async = require('async');

exports.description = '`!win [Team] {name}` - Report a win. Ex. `!win Team W`';
exports.matcher = /^\!win(?:\sTeam\s|\s)?(.*?)$/i;
exports.callback = function (route, message, response) {
  const scope = `${message.team}_${message.channel}`;
  if (!(message.channel in this.currentGames)) {
    return response('No game in progress. Use `!start` to start a game.');
  }

  if(!route.matches[1] || !(route.matches[1].toUpperCase() in this.currentGames[message.channel])) {
    return response('Please provide a valid team. For example `!win Team A`');
  }

  const winningTeam = route.matches[1].toUpperCase();
  saveGame(scope, this.currentGames[message.channel][winningTeam === 'W' ? 'W' : 'M'], this.currentGames[message.channel][winningTeam === 'W' ? 'M' : 'W']);

  response(`Congrats Team ${route.matches[1].toUpperCase()}!`);

  async.parallel([].concat(
    this.currentGames[message.channel]['W'].map(id => (callback) => incrementUserStats(scope, winningTeam === 'W' ? 'wins' : 'losses', id, callback)),
    this.currentGames[message.channel]['M'].map(id => (callback) => incrementUserStats(scope, winningTeam === 'M' ? 'wins' : 'losses', id, callback))
  ), (error, result) => {
    // Either way delete the game so it doesn't block
    delete this.currentGames[message.channel];

    if (error) {
      return console.log(error);
    }

    usersStore.get(scope, (error, users) => {
      if (error) {
        return console.log(error);
      }

      const rankings = users.rank().reverse();
      const top = rankings.slice(0, 3);

      async.parallel(top.map(user => callback => this.web.users.info(user.id, callback)), (error, result) => {
        if (error) {
          return console.log(error);
        }

        const leaderboard = result.map((entry, index) => `${index + 1}) ${entry.user ? entry.user.real_name || entry.user.name : entry.error}`);
        this.web.channels.setTopic(message.channel, leaderboard.join('\n'));
        return;
      });
    });
  });
};

function saveGame(scope, winner, loser) {
  gamesStore.add(scope, {
    winner,
    loser,
    timestamp: new Date().getTime()
  }, (error) => {
    if (error) {
      console.log(error);
    }
  });
}


function incrementUserStats (scope, key, id, callback) {
  usersStore.get(scope, (error, users) => {
    if (error) {
      return console.log(error);
    }
    const user = _.find(users, { id });

    if (user) {
      return usersStore.update(scope, { id }, Object.assign(user, {
        [key]: user[key] + 1
      }), callback);
    } else {
      return usersStore.add(scope, Object.assign({
        id,
        wins: 0,
        losses: 0
      }, { [key]: 1 }), callback);
    }
  });
}
