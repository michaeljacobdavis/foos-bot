const slack = require('@slack/client');
const shuffle = require('array-shuffle');

exports.matcher = /^!in(?:\s<@)?(.*?)>?$/;
exports.callback = function (route, message, response) {
  // Check if game is in progress
  if (!(message.channel in this.currentGames)) {
    return response('No game in progress. Use `!start` to start a game.');
  }

  const addPlayer = (player) => {
    if (Object.keys(currentGame.players).length >= this.maximum) {
      return response('Sorry, the maximum number of players have joined.');
    }

    currentGame.players[player.id] = player.real_name || player.name;
    response(`Current players:  ${Object.keys(currentGame.players).map(key => currentGame.players[key]).join(', ')}`);

    const currentPlayers = Object.keys(currentGame.players);

    // Ready to start the game
    if (currentPlayers.length >= this.maximum) {
      const shuffledPlayers = shuffle(currentPlayers);

      const left = shuffledPlayers.splice(0, Math.floor(shuffledPlayers.length / 2));
      const right = shuffledPlayers;

      response(`*${left.map(key => currentGame.players[key]).join(', ')}* vs *${right.map(key => currentGame.players[key]).join(', ')}*`);
      response('Let the foos begin!')
      delete this.currentGames[message.channel];
    }
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
