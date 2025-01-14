const mongoose = require("mongoose");

// Expense Schema
const expenseSchema = mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "group",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paidBy: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "groupMember",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      paidAmount: {
        type: Number,
        required: true,
      },
    },
  ],
  participants: [
    {
      memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "groupMember",
        required: true,
      },
    },
  ],
  splitType: {
    type: String,
    enum: ["equal", "unequal"],
    required: true,
  },
  splitAmount: [
    {
      memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "groupMember",
      },
      memberName: { type: String },
      amount: { type: Number },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("expense", expenseSchema);
