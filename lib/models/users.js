const store = require('./store');
const constant = 10;

module.exports = users = store('users');

users.getWinAverage = function () {
  return this.meanBy(function (user) { return user.wins / (user.wins + user.losses); })
};

users.getRankingFor = function (id) {
  const user = this.find({ id });
  const wins = user ? user.wins : 0;
  const losses = user ? user.losses : 0;

  return (wins + constant * this.getWinAverage()) / (wins + losses + constant);
};

users.rank = function () {
  return this.chain()
    .sortBy((user) => this.getRankingFor(user.id))
    .value();
};
