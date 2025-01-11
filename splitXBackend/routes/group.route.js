const express = require("express");
const router = express.Router();
const verifyJwt = require("../middleware/auth.js");
const {
  addGroup,
  addMember,
  getAllMember,
  getAllGroupsOfUser,
  getGroupDetails,
} = require("../controller/group.controller.js");

router.route("/addGroup").post(verifyJwt, addGroup);
router.route("/addMember").post(verifyJwt, addMember);
router.route("/getAllMembers").post(verifyJwt, getAllMember);
router.route("/getAllGroups").get(verifyJwt, getAllGroupsOfUser);
router.route("/getGroupDetails/:groupId").get(verifyJwt, getGroupDetails);

module.exports = router;
