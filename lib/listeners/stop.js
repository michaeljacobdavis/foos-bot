exports.description = '`!stop` - stop a game';
exports.matcher = /^!stop$/i;
exports.callback = function (route, message, response) {
  clearTimeout(this.currentGames[message.channel].timeout);
  delete this.currentGames[message.channel];
  response('Game stopped.');
};
