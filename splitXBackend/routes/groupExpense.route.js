const express = require("express");
const router = express.Router();
const verifyJwt = require("../middleware/auth.js");
const {
  addExpense,
  getAllGroupExpenses,
  getExpense,
  settleBalance,
  updateExpense,
  getGroupBalance,
  deleteExpense,
} = require("../controller/groupExpense.controller.js");

router.route("/addExpense").post(verifyJwt, addExpense);
router
  .route("/getAllGroupExpense/:groupId")
  .get(verifyJwt, getAllGroupExpenses);
router.route("/getExpense/:expenseId").get(verifyJwt, getExpense);
router.route("/getGroupBalance/:groupId").get(verifyJwt, getGroupBalance);
router.route("/settleBalance").post(verifyJwt, settleBalance);
router.route("/updateExpense").patch(verifyJwt, updateExpense);
router.route("/deleteExpense/:expenseId").delete(verifyJwt, deleteExpense);

module.exports = router;
