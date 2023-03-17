const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
} = require("../controller/userController");

const express = require("express");

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/logout").get(logout);

module.exports = router;
