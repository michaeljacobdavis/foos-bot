const slack = require('@slack/client');

exports.matcher = /^!out(?:\s<@)?(.*?)>?$/i;
exports.callback = function (route, message, response) {
  // Check if game is in progress
  if (!(message.channel in this.currentGames)) {
    return response('No game in progress. Use `!start` to start a game.');
  }

  const addPlayer = (player) => {
    delete currentGame.players[player.id];
    response(`Current players:  ${Object.keys(currentGame.players).map(key => currentGame.players[key]).join(', ')}`);
  };

  const currentGame = this.currentGames[message.channel];

  if (route.matches[1]) {
    this.web.users.list((error, data) => {
      if (error) {
        return console.log(error);
      }

      const mentionedUser = data.members.find((user) => {
        return user.id === route.matches[1];
      });

      addPlayer(mentionedUser);
    });
  } else {
    this.web.users.info(message.user, (error, data) => {
      if (error) {
        return console.log(error);
      }

      addPlayer(data.user);
    });
  }
};
