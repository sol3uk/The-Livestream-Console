const { google } = require('googleapis');
const { config } = require('./config');

const auth = new google.auth.OAuth2(
  config.googleapis.clientId,
  config.googleapis.clientSecret,
  config.googleapis.redirectUrl,
);

module.exports.googleAuth = auth;
