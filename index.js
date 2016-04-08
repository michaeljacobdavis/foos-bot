const Bot = require('slacky');
const WebClient = require('@slack/client').WebClient;
const startListen = require('./lib/start');
const inListen = require('./lib/in');
const stopListen = require('./lib/stop');
const outListen = require('./lib/out');
const token = process.env.SLACK_API_TOKEN || '';

module.exports = bot = new Bot(token);

bot.web = new WebClient(token);
bot.currentGames = {};
bot.maximum = 4;

// Add listeners
[startListen, inListen, outListen, stopListen].forEach((listener) => {
  bot.listen(listener.matcher, listener.callback);
})

bot.start();
