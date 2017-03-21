const users = require('../models/users');
const games = require('../models/games').games;
const async = require('async');
const _ = require('lodash');

const desc = 'top 20 players';

exports.description = '`!alltime` - ' + desc;
exports.matcher = /^\!alltime$/i;
exports.callback = function (route, message, response) {
	if (this.web.users) {
		return top20(route, message, response, this.web.users);
	}
};

function top20 (route, message, response, slackUsers) {
	const rankings = users.rank().reverse().slice(0, 20);

	async.parallel(rankings.map(user => callback => slackUsers.info(user.id, callback)), (error, result) => {
		if (error) {
		  return console.log(error);
		}

		const userMap = {};
		_.each(result, function (data) {
			userMap[data.user.id] = data.user.real_name || data.user.name;
		});

		const resultsHeader = `\n> :soccer: *Top 20*\n`;
		const standings = rankings.map((user, index) => `${index + 1}) ${userMap[user.id]} _(${users.getRankingForPretty(user.id)}%)_`).join('\n');

		response(resultsHeader + standings);
		return;
	});
};
