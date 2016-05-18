const games = require('../models/games');
const users = require('../models/users');
const async = require('async');
const _ = require('lodash');

exports.description = '`!rollstats` - rolling past 7 days';
exports.matcher = /^\!rollstats$/i;

exports.callback = function (route, message, response) {
  const rolling = games.rolling();
  const rankings = users.rank();
  const self = this;

  async.parallel(rankings.map(user => callback => this.web.users.info(user.id, callback)), (error, result) => {
    if (error) {
      return console.log(error);
    }

    const userNames = {};
	const userNameMap = result.map(data => {
        const u = {};
        u[data.user.id] = data.user.real_name || data.user.name;
        userNames[data.user.id] = data.user.real_name || data.user.name;
        return u;
    });

    this.userRankMap = {};
    const rankMap = rolling.map((data) => {

	_.each(data.winner, function(winner) {
        if (!self.userRankMap[winner]) {
            self.userRankMap[winner] = {};
        }

		const score = self.userRankMap[winner].wins ? (self.userRankMap[winner].wins + 1) : 1;
		self.userRankMap[winner].wins = score;
	});

    _.each(data.loser, function(loser) {
        if (!self.userRankMap[loser]) {
            self.userRankMap[loser] = {};
        }

        const score = self.userRankMap[loser].losses ? (self.userRankMap[loser].losses + 1) : 1;
        self.userRankMap[loser].losses = score;
    });

	return; });

    const ranks = [];
    const userIds = Object.keys(this.userRankMap);
    _.each(userIds, function (id) {
        const u = {};
        u.id = id;
        u.wins = self.userRankMap[id].wins || 0;
        u.losses = self.userRankMap[id].losses || 0;
        ranks.push(u);
    })

    response(ranks.map((user, index) => 
    		`${index + 1}) ${userNames[user.id]} ${users.getRankings(ranks, user.wins, user.losses)}`
    	).join('\n'));

    return;
  });
};
