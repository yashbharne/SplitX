const express = require("express");
const router = express.Router();
const verifyJwt = require("../middleware/auth.js");
const {
  addExpense,
  getAllGroupExpenses,
  getExpense,
  calculateGroupBalances,
  settleBalance,
} = require("../controller/groupExpense.controller.js");

router.route("/addExpense").post(verifyJwt, addExpense);
router
  .route("/getAllGroupExpense/:groupId")
  .get(verifyJwt, getAllGroupExpenses);
router.route("/getExpense/:expenseId").get(verifyJwt, getExpense);
router
  .route("/getGroupBalance/:groupId")
  .get(verifyJwt, calculateGroupBalances);
router.route("/settleBalance").post(verifyJwt, settleBalance);

module.exports = router;
