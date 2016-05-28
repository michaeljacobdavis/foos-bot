const db = require('monk')(process.env.MONGODB_URI);

module.exports = (collection, callback) => {
  db.get(collection).find({}, (err, docs) => {
    callback(docs);
  });
};
