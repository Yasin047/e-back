const router = require("express").Router();
const { isAuthenticate } = require("../middlewares/authentication");

const {
  configController,
  paymentController,
} = require("../controllers/paymentController");

router.get("/config", isAuthenticate, configController);
router.post("/create-payment-intent", isAuthenticate, paymentController);

module.exports = router;
