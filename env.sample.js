let vars = {
  HAWK_TOKEN: '',

  LOG_LEVEL: 'debug',

  // DEBUG: true,

  GOOGLE_CLIENT_ID: '',

  GOOGLE_REDIRECT_URI: 'https://api.notes.ifmo.su/oauth/code',
  API_ENDPOINT: 'https://api.notes.ifmo.su/graphql',
  REALTIME_DAEMON: 'wss://api.notes.ifmo.su:22002',

// LOCAL DEV
// GOOGLE_REDIRECT_URI: 'http://localhost:8081/oauth/code',
// API_ENDPOINT: 'http://localhost:8081/graphql',
// REALTIME_DAEMON: 'ws://localhost:8081',
};

for (let property in vars) {
  process.env[property] = vars[property];
}
