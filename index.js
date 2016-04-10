const Bot = require('slacky');
const WebClient = require('@slack/client').WebClient;
const whitelist = require('./lib/middleware/whitelist').whitelist;
const startListen = require('./lib/listeners/start');
const inListen = require('./lib/listeners/in');
const stopListen = require('./lib/listeners/stop');
const outListen = require('./lib/listeners/out');
const winListen = require('./lib/listeners/win');
const helpListen = require('./lib/listeners/help');
const token = process.env.SLACK_API_TOKEN || '';

module.exports = bot = new Bot(token);

bot.use(whitelist(['foos', 'mikestest']));
bot.web = new WebClient(token);
bot.currentGames = {};
bot.maximum = 4;

// Add listeners
[startListen, inListen, outListen, stopListen, winListen, helpListen].forEach((listener) => {
  bot.listen(listener.matcher, listener.callback);
})

bot.start();
