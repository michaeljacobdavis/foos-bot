const gamesStore = require('../stores/games');
const async = require('async');
const _ = require('lodash');

exports.description = '`!stat-teams';
exports.matcher = /^\!stat-teams$/i;
exports.callback = function (route, message, response) {
  gamesStore.get(`${message.team}_${message.channel}`, (error, games) => {
    const users = [];
    const teams = games.reduce((map, game) => {
      const winKey = game.winner.sort().join('|');
      map.won[winKey] = (map.won[winKey] || 0) + 1;
      const loseKey = game.loser.sort().join('|');
      map.lost[loseKey] = (map.lost[loseKey] || 0) + 1;

      // Add users
      [].concat(game.winner, game.loser).forEach(u => users.indexOf(u) === -1 && users.push(u));
      return map;
    }, {
      lost: {},
      won: {}
    });

    async.parallel(users.map(userid => callback => this.web.users.info(userid, callback)), (error, result) => {
      if (error) {
        return console.log(error);
      }
      const userMap = result.reduce((map, data) => {
        map[data.user.id] = data.user.real_name || data.user.name;
        return map;
      }, {});

      response([
        `*Wins* \n ${Object.keys(teams.won).map(team => `${team.split('|').map(player => userMap[player]).join(' and ')} (${teams.won[team]})`).join('\n')}`,
        `*Losses* \n ${Object.keys(teams.lost).map(team => `${team.split('|').map(player => userMap[player]).join(' and ')} (${teams.lost[team]})`).join('\n')}`
      ].join('\n'));
    });
  });
};
