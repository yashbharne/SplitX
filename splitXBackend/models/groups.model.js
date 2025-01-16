const mongoose = require("mongoose");

const groupSchema = mongoose.Schema({
  groupName: { type: String, required: true, unique: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      memberId: { type: mongoose.Schema.Types.ObjectId, ref: "groupMember" },
    },
  ],
  settlement: [
    {
      creditor: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "groupMember", // Reference to groupMember model
      },
      creditorAmount: {
        type: Number,
        default: 0,
      },
      member: [
        {
          memberId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "groupMember", // Reference to groupMember model
          },
          amount: {
            type: Number, // Amount owed to the creditor
            default: 0,
          },
        },
      ],
    },
  ],
  paidTransaction: [
    {
      creditorId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      debtorId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      amount: {
        type: Number,
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("group", groupSchema);
