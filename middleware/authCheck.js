const { googleAuth } = require("../googleAuth");

module.exports.authCheck = async (req, res, next) => {
  if (!req.cookies.google_tokens) return res.redirect("/");
  googleAuth.setCredentials(req.cookies.google_tokens);
  next();
};

module.exports.isLoggedIn = (req, res, next) => {
  req.isLoggedIn = !!req.cookies?.google_tokens;
  next();
};
