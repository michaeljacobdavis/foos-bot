const provider = require('../providers')[process.env.STORE_PROVIDER];

module.exports = provider('users');
