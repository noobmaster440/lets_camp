var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var localStrategy = require("passport-local");
var User = require("./models/user");
var seedDb = require("./seed.js");
var campgroundRoutes = require("./routes/campgrounds");
var reviewRoutes = require("./routes/review");
var commentRoutes = require("./routes/comments");
var indexRoutes = require("./routes/index");
var methodOverride = require("method-override");
var flash = require("connect-flash");

mongoose.connect("mongodb://localhost/yelpcamp_v13", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//passport configuration
app.use(
  require(`express-session`)({
    secret: `you are an asshole`,
    resave: false,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.locals.moment = require("moment");
// seedDb();
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.listen("37657", () => {
  console.log(`YelpCamp Server has been started...`);
});
