const router = require("express").Router();
const { isAuthenticate, checkRole } = require("../middlewares/authentication");

const {
  singleProductAllReviewsController,
  singleProductAllReviewsAdminController,
  productCreateReviewController,
  productDeleteReviewController,
} = require("../controllers/productReviewsController");

router.get("/product-reviews/:productId", singleProductAllReviewsController);

router.get(
  "/product-reviews-admin/:productId",
  isAuthenticate,
  checkRole(["admin"]),
  singleProductAllReviewsAdminController
);

router.post(
  "/product-createreview",
  isAuthenticate,
  productCreateReviewController
);

router.post(
  "/product-deletereview",
  isAuthenticate,
  productDeleteReviewController
);

module.exports = router;
