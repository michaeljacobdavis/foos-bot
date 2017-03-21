const store = require('./store').db;
const rollingStore = require('./store').rolling;
const archiveStore = require('./store').archive;
const _ = require('lodash');
const config = require('../../config.json');
const HOME_FIELD_COLOR = config.fieldColor.HOME_FIELD_COLOR;
const AWAY_FIELD_COLOR = config.fieldColor.AWAY_FIELD_COLOR;

const isRolling = process.argv.length > 2 ? (process.argv[2] === '--rolling' ? true : false) : false;

module.exports = games = {
  games: isRolling ? rollingStore('games') : store('games'),
  archive: archiveStore('games')
}


games.games.getOnlyPast7Days = function (days, timestamp) {
	const game = this.find({ timestamp });
	const d = new Date();
	d.setDate(d.getDate() - days);
  return timestamp >= d.getTime();
};

games.games.rolling = function (days) {
  return this.chain()
    .filter((game) => this.getOnlyPast7Days(days, game.timestamp))
    .value();
};

games.games.deleteOlderThen7Days = function (game, days) {
	const d = new Date();
	d.setDate(d.getDate() - days);
  	if (game.timestamp < d.getTime()) {
  		return true;
  	}
};

games.games.rollingPurge = function (days) {

  var expiredGames = this.chain()
    .filter((game) => this.deleteOlderThen7Days(game, days))
    .value();

    _.each(expiredGames, function (exp) {
    	games.games.remove(exp);
    });
};

games.games.homeField = function () {
	const whiteCnt = this.reduce( function (cnt, game) {
			return (game.winningFieldColor === HOME_FIELD_COLOR) ? cnt + 1 : cnt;
			}, 0);
	const blueCnt = this.reduce( function (cnt, game) {
			return (game.winningFieldColor === AWAY_FIELD_COLOR) ? cnt + 1 : cnt;
			}, 0);
	return whiteCnt > blueCnt ? HOME_FIELD_COLOR : AWAY_FIELD_COLOR;
};