const monk = require('monk');

module.exports = (collection) => {
  const db = monk(process.env.MONGODB_URI).get(collection);
  return {
    add: db.insert.bind(db),
    update: db.update.bind(db),
    get: (callback) => {
      db.find({}, (error, data) => callback(error, require(`../models/${collection}`)(data)))
    }
  };
};
