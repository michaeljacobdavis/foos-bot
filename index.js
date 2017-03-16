const Bot = require('slacky');
const WebClient = require('@slack/client').WebClient;
const whitelist = require('slacky-middleware-white-black-list').whitelist;
const startListen = require('./lib/listeners/start');
const inListen = require('./lib/listeners/in');
const stopListen = require('./lib/listeners/stop');
const outListen = require('./lib/listeners/out');
const winListen = require('./lib/listeners/win');
const helpListen = require('./lib/listeners/help');
const statsListen = require('./lib/listeners/stats');
const statListen = require('./lib/listeners/stat');
const fieldListen = require('./lib/listeners/field');
const token = process.env.SLACK_API_TOKEN || 'xoxb-42755557314-EKXlEOaUqrqu8WjAcF0T1hCp';

module.exports = bot = new Bot(token);
bot.web = new WebClient(token);

bot.use(whitelist(['foos', 'foosbottest'], bot.web));
bot.currentGames = {};
bot.maximum = 4;
bot.timeout = 10 * 60 * 1000;

// Add listeners
[
  startListen,
  inListen,
  outListen,
  stopListen,
  winListen,
  helpListen,
  statListen,
  statsListen,
  fieldListen
].forEach((listener) => {
  bot.listen(listener.matcher, listener.callback);
})

bot.start();
