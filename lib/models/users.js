const _ = require('lodash').runInContext();
const constant = 10;

module.exports = (users) => {
  users = users || [];

  users.getWinAverage = function () {
    return _.meanBy(users, (user) =>  user.wins / (user.wins + user.losses));
  };

  users.getRankingFor = function (id) {
    const user = _.find(users, { id });
    const wins = user ? user.wins : 0;
    const losses = user ? user.losses : 0;

    return (wins + constant * this.getWinAverage()) / (wins + losses + constant);
  };

  users.getRankingForPretty = function (id) {
    uglyRanking = this.getRankingFor(id);
    return (parseFloat(Math.round(uglyRanking * 10000) / 100).toFixed(2));
  };

  users.rank = function () {
    return _.chain(users)
      .sortBy((user) => this.getRankingFor(user.id))
      .value();
  };

  return users;
};
