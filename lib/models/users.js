const store = require('./store').users;
const constant = 10;

module.exports = users = store('users');

users.getWinsAverage = function (ranks) {
  return ranks.meanBy(function (user) { return user.wins / (user.wins + user.losses); })
};

users.getRankings = function (ranks, wins, losses) {
  var rank = (wins + constant * this.getWinAverage(ranks)) / (wins + losses + constant);
  return Math.round(rank * 100) / 100;
};

users.getPureRankings = function (ranks, wins, losses) {
  var rank = (wins) / (wins + losses);
  // return Math.round(rank * 100) / 100;
  return (rank * 100).toFixed(2);
};

users.getWinAverage = function () {
  return this.meanBy(function (user) { return user.wins / (user.wins + user.losses); })
};

users.getRankingSimple = function (id) {
  const user = this.find({ id });
  const wins = user ? user.wins : 0;
  const losses = user ? user.losses : 0;

  return wins / (wins + losses);
};

users.getRankingFor = function (id) {
  const user = this.find({ id });
  const wins = user ? user.wins : 0;
  const losses = user ? user.losses : 0;

  return (wins + constant * this.getWinAverage()) / (wins + losses + constant);
};

users.getRankingForPretty = function (id) {
  uglyRanking = this.getRankingFor(id);
  return (parseFloat(Math.round(uglyRanking * 10000) / 100).toFixed(2));
};

users.rankSimple = function () {
  return this.chain()
    .sortBy((user) => this.getRankingSimple(user.id))
    .value();
};

users.rank = function () {
  return this.chain()
    .sortBy((user) => this.getRankingFor(user.id))
    .value();
};
