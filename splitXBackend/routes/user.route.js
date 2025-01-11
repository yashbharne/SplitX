const express = require("express");
const router = express.Router();
const verifyJwt = require("../middleware/auth.js");
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getProfile,
} = require("../controller/user.controller.js");
const upload = require("../middleware/multer.js");

router.route("/addUser").post(upload.single("profilePic"), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/refresh-token").post(refreshToken);
router.route("/profile").get(verifyJwt, getProfile);

module.exports = router;
