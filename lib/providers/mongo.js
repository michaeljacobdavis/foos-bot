const monk = require('monk');

module.exports = (collection) => {
  const db = monk(process.env.MONGODB_URI);
  return {
    add: (scope, entry, callback) => db.get(`${scope}_${collection}`).insert(entry, callback),
    update: (scope, search, entry, callback) => db.get(`${scope}_${collection}`).update(search, entry, callback),
    get: (scope, callback) => db.get(`${scope}_${collection}`).find({}, (error, data) => {
      callback(error, require(`../models/${collection}`)(data))
    })
  };
};
