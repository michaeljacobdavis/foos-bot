const users = require('../models/users');
const async = require('async');
const _ = require('lodash');

exports.description = '`!stat [@name]` - stats for player';
exports.matcher = /^\!stat(?:\s<@(.*?)>)?$/i;
exports.callback = function (route, message, response) {
  const user = users.find({ id: route.matches[1] ? route.matches[1] : message.user });
  if (!user) {
    return response('No user data.');
  }

  response(`${user.wins} - ${user.losses}`);
};
