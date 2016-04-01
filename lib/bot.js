const slack = require('@slack/client');

function Bot (token, rtmOptions, webOptions) {
  this.rtm = new slack.RtmClient(token, rtmOptions);
  this.web = new slack.WebClient(token, webOptions);
  this.rtm.start();
}

module.exports = Bot;
