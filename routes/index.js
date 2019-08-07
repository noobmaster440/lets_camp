const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

router.get("/", (req, res) => {
  res.render(`landing.ejs`);
});

router.get(`/register`, (req, res) => {
  res.render(`register`, { page: "register" });
});

router.post(`/register`, (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        return res.render(`register`, { error: err.message });
      }
      passport.authenticate(`local`)(req, res, () => {
        req.flash("success", "Welcome to YelpCamp " + user.username);
        res.redirect(`/campgrounds`);
      });
    }
  );
});

// ==================
// login routes
router.get(`/login`, (req, res) => {
  res.render("login", { page: "login" });
});
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/campgrounds"
  })(req, res, next);
});
//logout route
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged you out");
  res.redirect("/campgrounds");
});

module.exports = router;
