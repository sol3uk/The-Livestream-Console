require('dotenv').config();

module.exports.config = {
  googleapis: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUrl: process.env.GOOGLE_REDIRECT_URL,
  },
  cookieSecret: process.env.COOKIE_SECRET,
};
