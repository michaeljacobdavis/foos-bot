const users = require('../models/users');
const games = require('../models/games').games;
const archive = require('../models/games').archive;
const async = require('async');
const request = require('request');
const config = require('../../config.json');

const days = require('../../config.json').rollingStatsDays || 7;
const isRolling = process.argv.length > 2 ? (process.argv[2] === '--rolling' ? true : false) : false;

const HOME_FIELD_COLOR = config.fieldColor.HOME_FIELD_COLOR;
const AWAY_FIELD_COLOR = config.fieldColor.AWAY_FIELD_COLOR;

exports.description = '`!win [Team] {name}` - Report a win. Ex. `!win Team W`';
exports.matcher = /^\!win(?:\sTeam\s|\s)?(.*?)$/i;
exports.callback = function (route, message, response) {
  if (!(message.channel in this.currentGames)) {
    return response('No game in progress. Use `!start` to start a game.');
  }

  if(!route.matches[1] || !(route.matches[1].toUpperCase() in this.currentGames[message.channel])) {
    return response('Please provide a valid team. For example `!win Team A`');
  }

  const winningTeam = route.matches[1].toUpperCase();
  const winningFieldColor = (winningTeam === 'W' ? AWAY_FIELD_COLOR : HOME_FIELD_COLOR);
  saveGame(this.currentGames[message.channel][winningTeam === 'W' ? 'W' : 'M'], this.currentGames[message.channel][winningTeam === 'W' ? 'M' : 'W'], winningFieldColor);;

  this.currentGames[message.channel]['W'].forEach(id => incrementUserStats(winningTeam === 'W' ? 'wins' : 'losses', id));
  this.currentGames[message.channel]['M'].forEach(id => incrementUserStats(winningTeam === 'M' ? 'wins' : 'losses', id));

  delete this.currentGames[message.channel];

  response(`Congrats Team ${route.matches[1].toUpperCase()}!`);

  if (isRolling) {
    // loop thru db and remove all records older than 7 days
    games.rollingPurge(days);
  }

  // SHOW TOP 3 RANKED
  const simpleRank = users.rankSimple();
    async.parallel(simpleRank.map(user => callback => this.web.users.info(user.id, callback)), (error, result) => {
    if (error) {
      return console.log(error);
    }
    const userNames = {};
    const userNameMap = result.map(data => {
          const u = {};
          u[data.user.id] = data.user.real_name || data.user.name;
          userNames[data.user.id] = data.user.real_name || data.user.name;
          return u;
    });

    const r = simpleRank.forEach(function (userStat) {
      userStat.name = userNames[userStat.id].split(' ')[0];
    });

    // postRankingToLeaderboard(simpleRank);
  });

  const rankings = users.rank().reverse();
  const top = rankings.slice(0, 3);

  async.parallel(top.map(user => callback => this.web.users.info(user.id, callback)), (error, result) => {
    if (error) {
      return console.log(error);
    }
    const leaderboard = result
                        .map((entry, index) => `${index + 1}) ${entry.user ? entry.user.real_name || entry.user.name : entry.error}`)
                        .join('\n');
    this.web.channels.setTopic(message.channel, leaderboard);
    return;
  });
};

function saveGame (winner, loser, winningFieldColor) {
  games.push({
    winner,
    loser,
    winningFieldColor: winningFieldColor,
    timestamp: new Date().getTime()
  });

  archive.push({
    winner,
    loser,
    winningFieldColor: winningFieldColor,
    timestamp: new Date().getTime()
  });
}


function incrementUserStats (key, id) {
  const chain = users.chain().find({ id });
  if (chain.value()) {
    chain.assign({
      [key]: chain.value()[key] + 1
    }).value();
  } else {
    users.push(Object.assign({
      id,
      wins: 0,
      losses: 0
    }, { [key]: 1 }));
  }
}


// function postRankingToLeaderboard (rankings) {
//   var url = "http://foos-leaderboard.appspot.com/leaderboard";
//   var data = rankings;

//   var options = {
//     rejectUnauthorized: false,
//     uri: url,
//     method: 'POST',
//       headers: {
//         "Content-Type": "application/json"
//       },
//     json: true,
//     body: rankings
//   };

//   doRequest(options, function (resp) {
//     console.log('\n\nsuccess');
//   });
// }

// function doRequest(options, callback) {
//   console.log('\n\nRequest << \n' + JSON.stringify(options));
//   request(options, function(error, response, body) {
//     console.log('\n\nResponse >> \n' + JSON.stringify(response));
//   })
// }