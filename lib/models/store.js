const low = require('lowdb');
const storage = require('lowdb/file-async');
const dbFile = 'db.json';
const dbUsersFile = 'users.json';
const dbRollingFile = 'rolling.json';
const dbArchiveFile = 'archive.json';

// const isRolling = process.argv.length > 2 ? (process.argv[2] === '--rolling' ? true : false) : false;
// if (isRolling) {
	// console.log("Rolling db: " + dbFile);
	module.exports = {
		db: low(dbFile, { storage }),
		users: low(dbUsersFile, { storage }),
		rolling: low(dbRollingFile, { storage }),
		archive: low(dbArchiveFile, { storage })
	}
// } else {
// 	module.exports = low(dbFile, { storage });
// }
