const games = require('../models/games').games;
const users = require('../models/users');
const async = require('async');

const days = 7;

exports.description = '`!rstats` - rolling past 7 days';
exports.matcher = /^\!rstats$/i;

exports.callback = function (route, message, response) {
  const rolling = games.rolling(days);
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

    const userRankMap = {};
    const rankMap = rolling.map((data) => {

        const winner = data.winner;
    	winner.forEach(function (id) {
            if (!userRankMap[id]) {
                userRankMap[id] = {};
            }

    		const score = userRankMap[id].wins ? (userRankMap[id].wins + 1) : 1;
    		userRankMap[id].wins = score;
    	});

        const loser = data.loser;
        loser.forEach(function (id) {
            if (!userRankMap[id]) {
                userRankMap[id] = {};
            }

            const score = userRankMap[id].losses ? (userRankMap[id].losses + 1) : 1;
            userRankMap[id].losses = score;
        });

    	return; 
    });

    const ranks = [];
    const id = Object.keys(userRankMap);
    id.forEach(function (id) {
        const u = {};
        u.id = id;
        u.wins = userRankMap[id].wins || 0;
        u.losses = userRankMap[id].losses || 0;
        ranks.push(u);
    })

    response(ranks.map((user, index) => 
    		`${index + 1}) ${userNames[user.id].split(' ')[0]} ${users.getPureRankings(ranks, user.wins, user.losses)} ( ${user.wins} / ${user.wins+user.losses} ) `
    	).join('\n'));

    return;
  });
};
