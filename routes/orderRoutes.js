const router = require("express").Router();
const { isAuthenticate, checkRole } = require("../middlewares/authentication");
const orderValidationSchema = require("../middlewares/orderValidation");

const {
  createOrderController,
  getSingleOrderController,
  getAllOrderController,
  getAdminAllOrderController,
  updateOrderController,
  deleteOrderController,
  weeklyIncomeController,
} = require("../controllers/orderController");

router.post(
  "/create-order",
  isAuthenticate,
  // orderValidationSchema,
  createOrderController
);

router.get("/getsingle-order/:_id", isAuthenticate, getSingleOrderController);

router.get("/getall-order", isAuthenticate, getAllOrderController);

router.get(
  "/getadminall-order",
  isAuthenticate,
  checkRole(["admin"]),
  getAdminAllOrderController
);

router.post(
  "/update-order",
  isAuthenticate,
  checkRole(["admin"]),
  updateOrderController
);

router.post(
  "/delete-order",
  isAuthenticate,
  checkRole(["admin"]),
  deleteOrderController
);

router.get(
  "/monthly-income",
  isAuthenticate,
  checkRole(["admin"]),
  weeklyIncomeController
);

module.exports = router;
