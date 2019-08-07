const express = require("express");
const router = express.Router({ mergeParams: true });
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middlewares");

router.get("/new", middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (!err) {
      res.render("comments/new", { campground: foundCampground });
    }
  });
});
//comment create route
router.post("/", middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, campground) => {
    if (!err) {
      Comment.create(req.body.comment, (err, comment) => {
        if (!err) {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          campground.comments.push(comment);
          campground.save();
          console.log(comment);
          res.redirect("/campgrounds/" + campground._id);
        }
      });
    }
  });
});
//edit route
router.get("/:comment_id/edit", middleware.checkCommentAuth, (req, res) => {
  Comment.findById(req.params.comment_id, (err, comment) => {
    if (err) {
      res.render("back");
    } else {
      res.render("comments/edit", {
        comment: comment,
        campground_id: req.params.id
      });
    }
  });
});
//update route
router.put("/:comment_id", middleware.checkCommentAuth, (req, res) => {
  Comment.findByIdAndUpdate(
    req.params.comment_id,
    req.body.comment,
    (err, insComment) => {
      if (err) {
        res.render("back");
      } else {
        res.redirect("/campgrounds/" + req.params.id);
      }
    }
  );
});
//destroy route
router.delete("/:comment_id", middleware.checkCommentAuth, (req, res) => {
  Comment.findByIdAndDelete(req.params.comment_id, err => {
    if (err) {
      res.redirect("back");
    } else {
      req.flash("error", "Comment deleted");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

module.exports = router;
