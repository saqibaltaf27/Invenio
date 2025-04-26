// middlewares/auth.js
function ensureAuth(req, res, next) {
    if (req.session?.user) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  }
  module.exports = ensureAuth;
  