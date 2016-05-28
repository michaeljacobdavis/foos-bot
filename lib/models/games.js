const store = require('./store');
const config = require('../../config.json');
const HOME_FIELD_COLOR = config.fieldColor.HOME_FIELD_COLOR;
const AWAY_FIELD_COLOR = config.fieldColor.AWAY_FIELD_COLOR;

module.exports = games = store('games');

games.getOnlyPast7Days = function (days, timestamp) {
	const game = this.find({ timestamp });
	const d = new Date();
	d.setDate(d.getDate() - days);
  return timestamp >= d.getTime();
};

games.rolling = function (days) {
  return this.chain()
    .filter((game) => this.getOnlyPast7Days(days, game.timestamp))
    .value();
};

games.homeField = function () {
	const whiteCnt = this.reduce( function (cnt, game) {
			return (game.winningFieldColor === HOME_FIELD_COLOR) ? cnt + 1 : cnt;
			}, 0);
	const blueCnt = this.reduce( function (cnt, game) {
			return (game.winningFieldColor === AWAY_FIELD_COLOR) ? cnt + 1 : cnt;
			}, 0);
	return whiteCnt > blueCnt ? HOME_FIELD_COLOR : AWAY_FIELD_COLOR;
};