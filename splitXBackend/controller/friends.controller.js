const GroupMember = require("../models/groupMembers.models.js");
const Group = require("../models/groups.model.js");

getAllFriendsOfUser = async (req, res) => {
    
    
  const userId = req.user._id;
  const userName = req.user.name;
  console.log(req.user);

  console.log(userId);

  try {
    const group = await Group.find({ createdBy: userId });
    if (!group) {
      res.status(400).json({ message: "No groups Found" });
    }

    const groupIds = group.map((group) => group._id);
    const groupMembers = await GroupMember.find({
      groupId: { $in: groupIds },
    })
      .select("_id")
      .populate("name");

    const uniqueMember = [
      ...new Set(groupMembers.map((member) => member.name.toString())),
    ];
    const filteredMembers = uniqueMember.filter(
      (member) => member !== userName.toLowerCase()
    );
    console.log(filteredMembers);

    return res.status(200).json({ filteredMembers });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server error: ", error });
  }
};

module.exports = { getAllFriendsOfUser };
