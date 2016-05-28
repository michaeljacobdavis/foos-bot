const low = require('lowdb');
const storage = require('lowdb/file-async');

module.exports = low('db.json', { storage });
