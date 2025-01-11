const mongoose = require("mongoose");

const groupMemberSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  groupId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "group",
  },
  owes: {
    type: Number,
    default: 0,
  },
  borrows: {
    type: Number,
    default: 0,
  },
 
});

module.exports = mongoose.model("groupMember", groupMemberSchema);
