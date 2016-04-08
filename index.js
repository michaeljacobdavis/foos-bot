const Bot = require('./lib/bot');
const slack = require('@slack/client');
const util = require('util');
const shuffle = require('array-shuffle');
const WebClient = slack.WebClient;
const events = slack.RTM_EVENTS;
const token = process.env.SLACK_API_TOKEN || '';

function FoosBot (token) {
  this.web = new WebClient(token);
  Bot.apply(this, arguments);
}

util.inherits(FoosBot, Bot);

module.exports = bot = new FoosBot(token);

bot.start();
bot.currentGames = {};
bot.maximum = 4;

const commands = {
  '!start': function (message, response) {
    if (message.channel in this.currentGames) {
      return response('A game has already been started! Use `!stop` to end the game.');
    }
    this.currentGames[message.channel] = {
      players: {}
    };
    response('Game Started! Respond with `!in` to join.');
  },
  '!in': function (message, response) {
    if (!(message.channel in this.currentGames)) {
      return response('No game in progress. Use `!start` to start a game.');
    }
    const currentGame = this.currentGames[message.channel];

    this.web.users.info(message.user, (error, data) => {
      if (error) {
        return console.log(error);
      }

      if (Object.keys(currentGame.players).length >= this.maximum) {
        return response('Sorry, the maximum number of players have joined.');
      }

      currentGame.players[message.user] = data.user.real_name || data.user.name;
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
    });
  },
  '!stop': function (message, response) {
    delete this.currentGames[message.channel];
    response('Game stopped.');
  }
};

bot.on(events.MESSAGE, (message) => {
  if (message.text in commands) {
    commands[message.text].call(bot, message, (response) => {
      bot.sendMessage(response, message.channel);
    });
  }
});
