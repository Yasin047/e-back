const router = require("express").Router();
const upload = require("../utils/multer");
const {
  userCreateValidationSchema,
  userLoginValidationSchema,
  userForgotPasswordValidationSchema,
  userUpdateValidationSchema,
} = require("../middlewares/userValidation");

const { isAuthenticate, checkRole } = require("../middlewares/authentication");

const {
  createUserController,
  loginUserController,
  userDetailsController,
  userForgotPasswordController,
  verifyTokenController,
  userResetPasswordController,
  updateUserProfileController,
  userProfileDeleteController,
  getAllUserController,
  updateUserRoleController,
  deleteUserController,
  weeklyTrafficesController,
} = require("../controllers/userController");

router.post(
  "/user-create",
  upload.single("image"),
  userCreateValidationSchema,
  createUserController
);

router.post("/user-login", userLoginValidationSchema, loginUserController);

router.get("/user-details/:_id", isAuthenticate, userDetailsController);

router.post(
  "/user-forgotpassword",
  userForgotPasswordValidationSchema,
  userForgotPasswordController
);

router.post("/user-verifytoken", verifyTokenController);

router.post(
  "/user-resetpassword",
  userLoginValidationSchema,
  userResetPasswordController
);

router.post(
  "/user-updateprofile",
  upload.single("image"),
  isAuthenticate,
  // userUpdateValidationSchema,
  updateUserProfileController
);

router.post("/user-profiledelete", isAuthenticate, userProfileDeleteController);

router.get(
  "/get-alluser",
  isAuthenticate,
  checkRole(["admin"]),
  getAllUserController
);

router.post(
  "/user-role",
  isAuthenticate,
  checkRole(["admin"]),
  updateUserRoleController
);

router.post(
  "/user-delete",
  isAuthenticate,
  checkRole(["admin"]),
  deleteUserController
);

router.get(
  "/weekly-users",
  isAuthenticate,
  checkRole(["admin"]),
  weeklyTrafficesController
);
module.exports = router;
