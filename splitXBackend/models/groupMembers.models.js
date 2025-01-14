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
});

module.exports = mongoose.model("groupMember", groupMemberSchema);
