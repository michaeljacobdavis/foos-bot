const store = require('./store');

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