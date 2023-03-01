const router = require("express").Router();
const upload = require("../utils/multer");
const productValidationSchema = require("../middlewares/productValidation");
const { isAuthenticate, checkRole } = require("../middlewares/authentication");

const {
  getProductController,
  getAllProductController,
  createProductController,
  updateProductController,
  deleteProductController,
  singleProductController,
} = require("../controllers/productController");

router.get("/product-get", getProductController);

router.get("/product-single/:_id", singleProductController);

router.get(
  "/allproduct-get",
  isAuthenticate,
  checkRole(["admin"]),
  getAllProductController
);

router.post(
  "/product-create",
  upload.array("images"),
  isAuthenticate,
  checkRole(["admin"]),
  productValidationSchema,
  createProductController
);
router.post(
  "/product-update",
  upload.array("images"),
  isAuthenticate,
  checkRole(["admin"]),
  // productValidationSchema,
  updateProductController
);
router.post(
  "/product-delete",
  isAuthenticate,
  checkRole(["admin"]),
  deleteProductController
);

module.exports = router;
