const slack = require('@slack/client');
const users = require('../models/users');

const usePrettyAnnounce = true;

exports.description = '`!in [@name]` - join current game';
exports.matcher = /^!in(?:\s<@(.*?)>)?$/i;
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
      // Clear the timeout
      clearTimeout(currentGame.timeout);

      const rankings = currentPlayers.map(id => {
        return {
          id,
          rank: users.getRankingFor(id)
        };
      }).sort((a, b) => a.rank - b.rank);

      currentGame.W = [rankings[0].id, rankings[3].id];
      currentGame.M = [rankings[1].id, rankings[2].id];

      if (usePrettyAnnounce) {
        response(getPrettyAnnounce(currentGame));
      }
      else {
        response(getStandardAnnounce(currentGame));
      }

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

function getPrettyAnnounce (gameToAnnounce) {
  var introString = 'Let the foos begin! ​:soccer:';
  var teamOneString = `\n> *Team W:* ${gameToAnnounce.W.map(key => gameToAnnounce.players[key]).join(' &amp; ')}`;
  var vsString = '\n> ~ vs ~';
  var teamTwoString = `\n> *Team M:* ${gameToAnnounce.M.map(key => gameToAnnounce.players[key]).join(' &amp; ')}`;
  var winInstructionsString = '\nType `!win <Team>` with the team name to report the victor.';
  return introString + teamOneString + vsString + teamTwoString + winInstructionsString;
}

function getStandardAnnounce (gameToAnnounce) {
  var teamsString = `*_Team W:_ ${gameToAnnounce.W.map(key => gameToAnnounce.players[key]).join(', ')}* vs *_Team M:_ ${gameToAnnounce.M.map(key => gameToAnnounce.players[key]).join(', ')}*`;
  var winInstructionsString = '\nLet the foos begin! Type `!win <Team>` with the team name to report the victor.';
  return teamsString + winInstructionsString;
}
