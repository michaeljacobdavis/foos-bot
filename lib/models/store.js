const low = require('lowdb');
const storage = require('lowdb/file-async');
const dbFile = 'db.json';
const dbUsersFile = './db/users.json';
const dbRollingFile = './db/rolling.json';
const dbArchiveFile = './db/archive.json';

module.exports = {
	db: low(dbFile, { storage }),
	users: low(dbUsersFile, { storage }),
	rolling: low(dbRollingFile, { storage }),
	archive: low(dbArchiveFile, { storage })
}
