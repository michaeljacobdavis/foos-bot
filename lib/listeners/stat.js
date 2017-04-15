const usersStore = require('../stores/users');
const async = require('async');
const _ = require('lodash');

exports.description = '`!stat [@name]` - stats for player';
exports.matcher = /^\!stat(?:\s<@(.*?)>)?$/i;
exports.callback = function (route, message, response) {
  usersStore.get(`${message.team}_${message.channel}`, (error, users) => {
    const user = _.find(users, { id: route.matches[1] ? route.matches[1] : message.user });
    if (!user) {
      return response('No user data.');
    }

    response(`${user.wins} - ${user.losses}`);
  });
};
