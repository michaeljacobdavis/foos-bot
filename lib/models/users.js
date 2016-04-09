const store = require('./store');
const constant = 10;

module.exports = users = store('users');

users.getWinAverage = function () {
  return this.meanBy(function (user) { return user.wins / (user.wins + user.losses); })
};

users.getRankingFor = function (id) {
  const user = this.find({ id });
  if (!user) {
    return 1;
  }

  return (user.wins + constant * this.getWinAverage()) / (user.wins + user.losses + constant);
};

users.rank = function () {
  return this.chain()
    .sortBy((user) => this.getRankingFor(user.id))
    .value();
};
