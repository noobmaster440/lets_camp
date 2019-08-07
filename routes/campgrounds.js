const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const middleware = require("../middlewares");
var Review = require("../models/review");

var NodeGeocoder = require("node-geocoder");
var options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
var geocoder = NodeGeocoder(options);

router.get("/", (req, res) => {
  //retrieve
  Campground.find({}, (err, Allcampgrounds) => {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/index.ejs", {
        campgrounds: Allcampgrounds,
        page: "campgrounds"
      });
    }
  });
});

//CREATE add a new campground to db//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res) {
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  geocoder.geocode(req.body.location, function(err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    console.log("hello saad");

    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {
      name: name,
      image: image,
      description: desc,
      author: author,
      location: location,
      lat: lat,
      lng: lng
    };
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated) {
      if (err) {
        console.log(err);
      } else {
        //redirect back to campgrounds page
        console.log(newlyCreated);
        res.redirect("/campgrounds");
      }
    });
  });
});

//NEW display form to make/store a new campground
router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/new.ejs");
});

//SHOW shows info about one campground
router.get("/:id", (req, res) => {
  //find campground with provided Id
  Campground.findById(req.params.id)
    .populate("comments")
    .populate({
      path: "reviews",
      options: { sort: { createdAt: -1 } }
    })
    .exec((err, foundCampground) => {
      if (err) {
        console.log(err);
      } else {
        //render show template with that campground
        console.log(foundCampground);
        res.render("campgrounds/show.ejs", { campground: foundCampground });
      }
    });
});
//edit
router.get("/:id/edit", middleware.checkCampgroundAuth, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    res.render("campgrounds/edit", { campground: foundCampground });
  });
});
// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundAuth, function(req, res) {
  geocoder.geocode(req.body.location, function(err, data) {
    if (err || !data.length) {
      console.log(err);
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(
      err,
      campground
    ) {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Successfully Updated!");
        res.redirect("/campgrounds/" + campground._id);
      }
    });
  });
});
//delete
router.delete("/:id", middleware.checkCampgroundAuth, (req, res) => {
  delete req.body.campground.rating;
  Campground.findByIdAndDelete(req.params.id, (err, delCampground) => {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      req.flash("success", "You have deleted the" + delCampground.name);
      res.redirect("/campgrounds");
    }
  });
});

module.exports = router;
