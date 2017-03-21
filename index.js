const Bot = require('slacky');
const WebClient = require('@slack/client').WebClient;
const whitelist = require('slacky-middleware-white-black-list').whitelist;
const startListen = require('./lib/listeners/start');
const unofficialListen = require('./lib/listeners/unofficial');
const inListen = require('./lib/listeners/in');
const stopListen = require('./lib/listeners/stop');
const outListen = require('./lib/listeners/out');
const winListen = require('./lib/listeners/win');
const helpListen = require('./lib/listeners/help');
const statsListen = require('./lib/listeners/stats');
const statListen = require('./lib/listeners/stat');
const alltimeListen = require('./lib/listeners/alltime');
const fieldListen = require('./lib/listeners/field');
const swapListen = require('./lib/listeners/swap');
const token = process.env.SLACK_API_TOKEN;

module.exports = bot = new Bot(token);
bot.web = new WebClient(token);

bot.use(whitelist(['foos'], bot.web));
bot.currentGames = {};
bot.maximum = 4;
bot.timeout = 10 * 60 * 1000;
bot.swapCnt = 0;
bot.unofficial = false;

// Add listeners
[
  startListen,
  unofficialListen,
  inListen,
  outListen,
  stopListen,
  winListen,
  helpListen,
  statListen,
  statsListen,
  alltimeListen,
  fieldListen,
  swapListen
].forEach((listener) => {
  bot.listen(listener.matcher, listener.callback);
})

bot.start();
