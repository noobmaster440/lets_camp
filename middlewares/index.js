const Campground = require("../models/campground");
const Comment = require("../models/comment");
const Review = require("../models/review");
var middlewareObj = {};

middlewareObj.checkCampgroundAuth = function(req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, foundCampground) => {
      if (err) {
        res.redirect("back");
      } else {
        if (foundCampground.author.id.equals(req.user._id)) {
          return next();
        } else {
          req.flash("error", "You are not authorised to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that");
  res.redirect("/login");
};

middlewareObj.checkCommentAuth = function(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err) {
        req.flash("error", "Cannot found requested Campground");
        res.redirect("back");
      } else {
        if (foundComment.author.id.equals(req.user._id)) {
          return next();
        } else {
          req.flash("error", "You are not authorised to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middlewareObj.checkReviewOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Review.findById(req.params.review_id, function(err, foundReview) {
      if (err || !foundReview) {
        res.redirect("back");
      } else {
        // does user own the comment?
        if (foundReview.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middlewareObj.checkReviewExistence = function(req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id)
      .populate("reviews")
      .exec(function(err, foundCampground) {
        if (err || !foundCampground) {
          req.flash("error", "Campground not found.");
          res.redirect("back");
        } else {
          // check if req.user._id exists in foundCampground.reviews
          var foundUserReview = foundCampground.reviews.some(function(review) {
            return review.author.id.equals(req.user._id);
          });
          if (foundUserReview) {
            req.flash("error", "You already wrote a review.");
            return res.redirect("/campgrounds/" + foundCampground._id);
          }
          // if the review was not found, go to the next middleware
          next();
        }
      });
  } else {
    req.flash("error", "You need to login first.");
    res.redirect("back");
  }
};

module.exports = middlewareObj;
