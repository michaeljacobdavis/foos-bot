const slack = require('@slack/client');
const users = require('../models/users');

const usePrettyAnnounce = true;
const showFavoredTeam = true;

const FAVORED_SLIGHT_MIN = 3;
const FAVORED_MIN = 10;
const FAVORED_HEAVILY_MIN = 20;

const config = require('../../config.json');
const HOME_FIELD_COLOR = '_(' + config.fieldColor.HOME_FIELD_COLOR + ')_';
const AWAY_FIELD_COLOR = '_(' + config.fieldColor.AWAY_FIELD_COLOR + ')_';

exports.description = '`!swap` - players swap';
exports.matcher = /^\!swap$/i;

exports.callback = function (route, message, response) {
  // Check if game is in progress
  if (!(message.channel in this.currentGames)) {
    return response('No game in progress. Use `!start` to start a game.');
  }

  const swapPlayer = () => {
    if (Object.keys(currentGame.players).length < this.maximum) {
      return response('Please make sure all players have joined.');
    }

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

      var player3 = 3;
      var player4 = 2;
      if (this.swapCnt === 0) {
        player3 = 2;
        player4 = 3;
        this.swapCnt = 1;
      } else {
        this.swapCnt = 0;
      }

      currentGame.W = [rankings[0].id, rankings[player3].id];
      currentGame.M = [rankings[1].id, rankings[player4].id];

      if (usePrettyAnnounce) {
        response(getPrettyAnnounce(currentGame));
      }
      else {
        response(getStandardAnnounce(currentGame));
      }

    }
  };

  const currentGame = this.currentGames[message.channel];
  swapPlayer();

};

function getPrettyAnnounce (gameToAnnounce) {
  var wDecorator = '';
  var mDecorator = '';

  var wAvg = (users.getRankingFor(gameToAnnounce.W[0]) + users.getRankingFor(gameToAnnounce.W[1])) / 2;
  var mAvg = (users.getRankingFor(gameToAnnounce.M[0]) + users.getRankingFor(gameToAnnounce.M[1])) / 2;

  var percentDiff = (wAvg - mAvg) / ((wAvg + mAvg) / 2) * 100;
  // Team W has a higher "team weighted win average"
  if (percentDiff > 0) {
    wDecorator = ' ' + getFavoredByAmount(percentDiff);
  }
  // Team M has a higher "team weighted win average"
  else if (percentDiff < 0) {
    percentDiff = percentDiff * -1;
    mDecorator = ' ' + getFavoredByAmount(percentDiff);
  }

  var introString = 'Let the foos begin! ​:soccer:';
  var teamOneString = `\n> *Team W ${AWAY_FIELD_COLOR}:* ${gameToAnnounce.W.map(key => gameToAnnounce.players[key]).join(' &amp; ')}` + wDecorator;
  var vsString = '\n> ~ vs ~';
  var teamTwoString = `\n> *Team M ${HOME_FIELD_COLOR}:* ${gameToAnnounce.M.map(key => gameToAnnounce.players[key]).join(' &amp; ')}` + mDecorator;
  var winInstructionsString = '\nType `!win <Team>` with the team name to report the victor.';
  return introString + teamOneString + vsString + teamTwoString + winInstructionsString;
}

function getStandardAnnounce (gameToAnnounce) {
  var teamsString = `*_Team W:_ ${gameToAnnounce.W.map(key => gameToAnnounce.players[key]).join(', ')}* vs *_Team M:_ ${gameToAnnounce.M.map(key => gameToAnnounce.players[key]).join(', ')}*`;
  var winInstructionsString = '\nLet the foos begin! Type `!win <Team>` with the team name to report the victor.';
  return teamsString + winInstructionsString;
}

function getFavoredByAmount (percentDiff) {
  if (percentDiff > FAVORED_SLIGHT_MIN && percentDiff < FAVORED_MIN) {
    return '_(slightly favored)_';
  }
  else if (percentDiff >= FAVORED_MIN && percentDiff < FAVORED_HEAVILY_MIN) {
    return '_(favored)_';
  }
  else if (percentDiff >= FAVORED_HEAVILY_MIN) {
    return '_(heavily favored)_';
  }
  return '';
}
