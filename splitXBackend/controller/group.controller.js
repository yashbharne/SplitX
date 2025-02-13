const Group = require("../models/groups.model.js");
const GroupMember = require("../models/groupMembers.models.js");
const User = require("../models/user.model.js");
const Expense = require("../models/groupExpense.models.js");
const uploadOnCloudinary = require("../utils/cloudinary.utils.js");

const addGroup = async (req, res) => {
  const { groupName } = req.body;
  console.log(req.body);
  console.log("File: ", req.file);

  const userId = req.user._id; // Assuming user is authenticated and user ID is available.

  const groupExists = await Group.findOne({ groupName: groupName });
  if (groupExists) {
    return res.status(400).json({ message: "Group already exists" });
  }

  try {
    // Step 1: Create the group
    const newGroup = new Group({
      groupName,
      createdBy: userId,
    });

    console.log(newGroup);

    await newGroup.save();

    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    console.log(user);

    //Step 2: Add the creator to the friends collection
    const creatorGroupMember = new GroupMember({
      name: user.name,
      groupId: newGroup._id,
    });

    await creatorGroupMember.save();

    const member = await GroupMember.findOne({ name: user.name });
    console.log(member);
    newGroup.members.push(member._id);

    const profileLocalPath = await req.file?.path;
    console.log("profileLocalPath: ", profileLocalPath);

    if (profileLocalPath) {
      const profile = await uploadOnCloudinary(profileLocalPath);
      newGroup.groupProfilePic = profile.url;
    }
    console.log("groupProfilePic: ", newGroup.groupProfilePic);

    await newGroup.save();

    res
      .status(200)
      .json({ message: "Group created successfully", group: newGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
};

const addMember = async (req, res) => {
  const { groupId, member } = req.body;

  if (!member || !Array.isArray(member)) {
    return res
      .status(400)
      .json({ error: "Member field must be a non-empty array" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Add new members to the group
    for (const memberName of member) {
      const existingMember = await GroupMember.findOne({
        groupId: groupId,
        name: memberName.toLowerCase(),
      });

      if (existingMember) {
        return res.status(400).json({
          message: `Member '${memberName}' is already present in the group`,
        });
      }

      const newMember = new GroupMember({
        groupId: groupId,
        name: memberName.toLowerCase(),
      });
      await newMember.save();
      group.members.push(newMember._id);
    }

    // Fetch all members of the group
    const allMembers = await GroupMember.find({ groupId: groupId });
    console.log("before Array: ", group.settlement);

    // Update the settlement array
    for (const creditor of allMembers) {
      // Check if this creditor already exists in the settlement array
      const existingCreditor = group.settlement.find(
        (settlement) => String(settlement.creditor) === String(creditor._id)
      );

      if (!existingCreditor) {
        // Create a new settlement entry for this creditor
        const settlementEntry = {
          creditor: creditor._id,
          member: allMembers
            .filter((m) => String(m._id) !== String(creditor._id)) // Exclude creditor from members
            .map((m) => ({ memberId: m._id, amount: 0 })),
        };

        group.settlement.push(settlementEntry);
      } else {
        // If creditor already exists, update members without duplicates
        const existingMemberIds = existingCreditor.member.map((m) =>
          String(m.memberId)
        );

        // Add new members to the existing creditor with amount: 0, ensuring no duplicates
        const newMembers = allMembers
          .filter(
            (m) =>
              String(m._id) !== String(creditor._id) &&
              !existingMemberIds.includes(String(m._id))
          )
          .map((m) => ({ memberId: m._id, amount: 0 }));

        // Only add unique members to the creditor
        existingCreditor.member.push(
          ...newMembers.filter(
            (newMember) =>
              !existingMemberIds.includes(String(newMember.memberId))
          )
        );
      }
    }

    // Update previous creditors with the new member
    for (const creditor of group.settlement) {
      if (String(creditor.creditor) !== String(allMembers[0]._id)) {
        // Check if the new member is already in the creditor's member list
        if (
          !creditor.member.some(
            (m) => String(m.memberId) === String(allMembers[0]._id)
          )
        ) {
          creditor.member.push({ memberId: allMembers[0]._id, amount: 0 });
        }
      }
    }

    console.log("after Array: ", group.settlement);

    await group.save();

    return res
      .status(200)
      .json({ message: "Members added successfully", group });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to add members" });
  }
};

const getAllMember = async (req, res) => {
  const { groupId } = req.body;

  if (!groupId) {
    return res.status(400).json({ message: "GroupId is required " });
  }

  try {
    const getMembers = await GroupMember.find({ groupId: groupId }).populate(
      "name"
    );
    if (!getMembers || getMembers.length === 0) {
      return res.status(400).json({ message: "No members found" });
    }
    return res.status(200).json({ getMembers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllGroupsOfUser = async (req, res) => {
  const userId = req.user._id;

  const group = await Group.find({ createdBy: userId });
  if (!group) {
    res.status(400).json({ message: "No groups Found" });
  }
  res.status(200).json({ group });
};

const getGroupDetails = async (req, res) => {
  const groupId = req.params.groupId;
  if (!groupId) {
    return res.status(400).json({ message: "Group Id is required " });
  }
  const group = await Group.findById(groupId).populate(
    "members.memberId",
    "name"
  );
  if (!group) {
    return res.status(400).json({ message: "Group not found " });
  }
  return res.status(200).json({ group });
};

const deleteGroup = async (req, res) => {
  const { groupId } = req.params;

  if (!groupId) {
    return res.status(400).json({ message: "GroupId is required" });
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group Not Found" });
    }

    // Delete all related group members
    const membersResult = await GroupMember.deleteMany({ groupId });
    console.log(`${membersResult.deletedCount} members deleted.`);

    // Delete all related expenses
    const expensesResult = await Expense.deleteMany({ groupId });
    console.log(`${expensesResult.deletedCount} expenses deleted.`);

    // Delete the group itself
    await group.deleteOne();
    console.log(`Group with ID ${groupId} deleted.`);

    return res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  addGroup,
  addMember,
  getAllMember,
  getAllGroupsOfUser,
  getGroupDetails,
  deleteGroup,
};
