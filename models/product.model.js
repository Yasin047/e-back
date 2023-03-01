const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  productDescription: {
    type: String,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  discountPrice: {
    type: String,
  },
  color: {
    type: String,
  },
  size: {
    type: String,
  },
  images: [
    {
      public_id: [{ type: String, required: true }],
      url: [{ type: String, required: true }],
    },
  ],
  productCategory: {
    type: String,
    required: true,
  },
  productStock: {
    type: Number,
    required: true,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      ratings: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      time: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  // user: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: "User",
  //   required: true,
  // },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Product = mongoose.model("product", productSchema);
module.exports = Product;
