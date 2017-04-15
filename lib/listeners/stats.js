const usersStore = require('../stores/users');
const async = require('async');
const _ = require('lodash');

exports.description = '`!stats` - top 20 players';
exports.matcher = /^\!stats$/i;
exports.callback = function (route, message, response) {
  usersStore.get(`${message.team}_${message.channel}`, (error, users) => {
    if (error) {
      return console.log(error);
    }

    const rankings = users.rank().reverse().slice(0, 20);

    async.parallel(rankings.map(user => callback => this.web.users.info(user.id, callback)), (error, result) => {
      if (error) {
        return console.log(error);
      }

      const userMap = result.reduce((map, data) => {
        map[data.user.id] = data.user.real_name || data.user.name;
        return map;
      }, {});
      if (rankings.length){
        response(rankings.map((user, index) => `${index + 1}) ${userMap[user.id]} (${users.getRankingForPretty(user.id)}%)`).join('\n'));
      } else {
        response('No rankings. Go play some foosball!');
      }
    });
  });
};
