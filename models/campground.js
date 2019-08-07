var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
  name: String,
  price: String,
  image: String,
  desc: String,
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  rating: {
    type: Number,
    default: 0
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  location: String,
  lat: Number,
  lng: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"
    },
    username: String
  }
});

module.exports = mongoose.model("Campground", campgroundSchema);
