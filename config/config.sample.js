// get current env mode
const env = process.env.NODE_ENV || 'development';

const envConfig = require('./env.json');

// get only the configuration of the current mode
const config = envConfig[env];

// add env to config
config.env = env;

// add bool to config
config.isDev = (env != 'production');

// expose config globally
global.serverConfig = config;

module.exports = config;