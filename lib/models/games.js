const store = require('./store');

module.exports = games = store('games');

games.getOnlyPast7Days = function (timestamp) {
	const game = this.find({ timestamp });
	const d = new Date();
	d.setDate(d.getDate() - 7);
  return timestamp >= d.getTime();
};

games.rolling = function () {
  return this.chain()
    .filter((game) => this.getOnlyPast7Days(game.timestamp))
    .value();
};