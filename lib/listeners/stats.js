const users = require('../models/users');
const games = require('../models/games').games;
const async = require('async');
const _ = require('lodash');
const days = require('../../config.json').rollingStatsDays || 7;
const isRolling = process.argv.length > 2 ? (process.argv[2] === '--rolling' ? true : false) : false;

const desc = isRolling ? 'rolling past ' + days + ' days' : 'top 20 players';

exports.description = '`!stats` - ' + desc;
exports.matcher = /^\!stats$/i;
exports.callback = function (route, message, response) {

	if (this.web.users) {
		if (isRolling) {
			return rolling(route, message, response, this.web.users);
		} else {
			return top20(route, message, response, this.web.users);
		}
	}
};

function top20 (route, message, response, slackUsers) {
	const rankings = users.rank().reverse().slice(0, 20);

	async.parallel(rankings.map(user => callback => slackUsers.info(user.id, callback)), (error, result) => {
		if (error) {
		  return console.log(error);
		}

		const userMap = {};
		var deletedUsersIds = [];
		_.each(result, function (data) {
			if (data.user && !data.user.deleted) {
				userMap[data.user.id] = data.user.real_name || data.user.name;
			}
			if (data.user && data.user.deleted) {
				deletedUsersIds.push(data.user.id);
			}
		});

		var rankingsActive = _.filter(rankings, function (user) {
			return deletedUsersIds.indexOf(user.id) === -1;
		});

		const resultsHeader = `\n> :soccer: *Top 20*\n`;
		const standings = rankingsActive.map((user, index) => `${index + 1}) ${userMap[user.id]} _(${users.getRankingForPretty(user.id)}%)_`).join('\n');

		response(resultsHeader + standings);
		return;
	});
};

function rolling (route, message, response, slackUsers) {
	const self = this;
	const rolling = games.rolling(days);
	const rankings = users.rank();

	async.parallel(rankings.map(user => callback => slackUsers.info(user.id, callback)), (error, result) => {
		if (error) {
		  return console.log(error);
		}

		const userNames = getSlackUserNamesMap(result);
		const userRankMap = getUserRankMap(rolling);
		const ranks = getRanks(userRankMap);


		const stats = _.without(ranks.map((user, index) => {
			if (userNames[user.id]) {
				return { 'name': userNames[user.id].split(' ')[0], 'rank': users.getPureRankings(ranks, user.wins, user.losses) }
			}
		}), null);

		const results = sortByKey(stats, 'rank');
		const resultsHeader = `\n> :soccer: *Rolling ` + days + ` day stats*\n`;
		const standings = results.map((user, index) => `${index + 1}) ${user.name} _(${user.rank} %)_ `).join('\n');

		response(resultsHeader + standings);
		return;
	});
};

function sortByKey (array, key) {
    return array.sort(function(a, b) {
        var x = parseFloat(parseFloat(a[key]).toFixed(2));
        var y = parseFloat(parseFloat(b[key]).toFixed(2));
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
};

function getRanks (userRankMap) {
	const ranks = [];
	const id = Object.keys(userRankMap);
	id.forEach(function (id) {
	    const u = {};
	    u.id = id;
	    u.wins = userRankMap[id].wins || 0;
	    u.losses = userRankMap[id].losses || 0;
	    ranks.push(u);
	});
	return ranks;
};

function getSlackUserNamesMap (result) {
	const userNames = {};
	const userNameMap = _.without(result.map(data => {
		if (data.user.id && data.user.id && !data.user.deleted) {
	    	const u = {};
	    	u[data.user.id] = data.user.real_name || data.user.name;
	    	userNames[data.user.id] = data.user.real_name || data.user.name;
	    	return u;
	    }
	}), null);
	return userNames;
};

function getUserRankMap (rolling) {
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
		return userRankMap;
};