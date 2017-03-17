const events = require('@slack/client').RTM_EVENTS;

exports.description = '`!unofficial` - start an off-record game';
exports.matcher = /^\!unofficial$/i;
exports.callback = function (route, message, response) {

  if (message.channel in this.currentGames) {
    return response('A game has already been started! Use `!stop` to end the game.');
  }
  this.currentGames[message.channel] = {
    timeout: setTimeout(() => {
      this.emit(events.MESSAGE, Object.assign({}, message, { text: '!stop' }));
    }, this.timeout),
    players: {}
  };
  this.unofficial = true;
  response('<!here> Game Started! Respond with `!in` to join.');

  this.emit(events.MESSAGE, Object.assign({}, message, { text: '!in' }));
};
