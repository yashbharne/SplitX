const express = require("express");
const router = express.Router();
const verifyJwt = require("../middleware/auth.js");
const { getAllFriendsOfUser } = require("../controller/friends.controller.js");

router.route("/").get(verifyJwt, getAllFriendsOfUser);

module.exports = router;
