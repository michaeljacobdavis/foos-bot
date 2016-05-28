const games = require('../models/games');

exports.description = '`!field` - which field color has home field advantage';
exports.matcher = /^\!field$/i;
exports.callback = function (route, message, response) {
  const field = games.homeField();
  if (!field) {
    return response('No field data.');
  }

  response('Favored field side: ' + `${field}`);
};
