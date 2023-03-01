const Product = require("../models/product.model");

const singleProductAllReviewsController = async (req, res) => {
  try {
    if (!req.params.productId) {
      return res.status(404).json({
        success: false,
        message: "ProductId not Found!",
      });
    }
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product is not Found!" });
    }
    res.status(200).json({
      success: true,
      allReviews: product,
    });
  } catch (error) {
    console.log(error.message);
    res.status(404).json({ success: false, message: "Something went wrong!" });
  }
};
const singleProductAllReviewsAdminController = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const perPage = req.query.perPage || 10;
    const { productId } = req.params;
    if (!productId) {
      return res
        .status(404)
        .json({ success: false, message: "Product is not Found!" });
    }
    const product = await Product.findById(productId)
      .skip((page - 1) * parseInt(perPage))
      .limit(parseInt(perPage));
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product is not Found!" });
    }

    res.status(200).json({
      success: true,
      allReviews: product,
    });
  } catch (error) {
    console.log(error.message);
    res.status(404).json({ success: false, message: "Something went wrong!" });
  }
};

const productCreateReviewController = async (req, res) => {
  try {
    const { ratings, comment, productId } = req.body;
    if (!(ratings || comment || productId)) {
      return res
        .status(400)
        .json({ message: "Please fill all the input field" });
    }
    const review = {
      user: req.user._id,
      name: req.user.name,
      ratings: Number(ratings),
      comment,
    };
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product is not Found!" });
    }
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString()) {
          (rev.ratings = ratings), (rev.comment = comment);
        }
      });
    } else {
      product.reviews = [...product.reviews, review];
      product.numberOfReviews = product.reviews.length;
    }
    let total = 0;

    product.reviews.forEach((rev) => {
      total += rev.ratings;
    });

    product.ratings = total / product.reviews.length;

    await product.save();

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ success: false, message: "Something went wrong!" });
  }
};

const productDeleteReviewController = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findOne({ productId });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product is not Found!" });
    }
    if (!req.body._id) {
      return res
        .status(404)
        .json({ success: false, message: "Product review id is not Found!" });
    }
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.body._id.toString()
    );
    let total = 0;

    reviews.forEach((rev) => {
      total += rev.ratings;
    });

    let ratings = 0;
    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = total / reviews.length;
    }

    const numberOfReviews = reviews.length;
    await Product.findByIdAndUpdate(
      productId,
      {
        reviews,
        ratings,
        numberOfReviews,
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      success: true,
      message: "Review is deleted Successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ success: false, message: "Something went wrong!" });
  }
};

module.exports = {
  singleProductAllReviewsController,
  singleProductAllReviewsAdminController,
  productCreateReviewController,
  productDeleteReviewController,
};
