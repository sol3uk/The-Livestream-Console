const { googleAuth } = require("../googleAuth");

module.exports.authCheck = async (req, res, next) => {
  if (!req.cookies.google_tokens) return res.redirect("/");
  // if (Object.values(googleAuth.credentials).length >= 1) {
  //   googleAuth.setCredentials({});
  // }
  googleAuth.setCredentials(req.cookies.google_tokens);
  next();
};

module.exports.isLoggedIn = (req, res, next) => {
  return req.cookies?.google_tokens ? true : false;
};
