const express = require("express");
const router = express.Router();
const verifyJwt = require("../middleware/auth.js");
const {
  addGroup,
  addMember,
  getAllMember,
  getAllGroupsOfUser,
  getGroupDetails,
  deleteGroup,
} = require("../controller/group.controller.js");
const upload = require("../middleware/multer.js");

router
  .route("/addGroup")
  .post(verifyJwt, upload.single("profilePic"), addGroup);
router.route("/addMember").post(verifyJwt, addMember);
router.route("/getAllMembers").post(verifyJwt, getAllMember);
router.route("/getAllGroups").get(verifyJwt, getAllGroupsOfUser);
router.route("/getGroupDetails/:groupId").get(verifyJwt, getGroupDetails);
router.route("/deleteGroup/:groupId").delete(verifyJwt, deleteGroup);

module.exports = router;
