const checkLogin = (req, res, next) => {
    if (req.session.uid) {
      return next();
    }
    res.redirect("/members");
  };
  
  module.exports = checkLogin;