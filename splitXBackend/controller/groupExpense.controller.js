const Expense = require("../models/groupExpense.models.js"); // Assuming expense schema is in the models folder
const Group = require("../models/groups.model.js");
const GroupMember = require("../models/groupMembers.models.js");

const addExpense = async (req, res) => {
  const { groupId, description, amount, participants, splitType, paidBy } =
    req.body;

  if (
    !groupId ||
    !description ||
    !amount ||
    !Array.isArray(participants) ||
    !participants.length ||
    !splitType ||
    !Array.isArray(paidBy) ||
    !paidBy.length
  ) {
    return res
      .status(400)
      .json({ message: "All fields are required and must be valid." });
  }

  if (isNaN(amount) || amount <= 0) {
    return res
      .status(400)
      .json({ message: "Amount must be a positive number." });
  }
  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: "Group not found." });
  }

  try {
    const totalPaid = paidBy.reduce(
      (sum, member) => sum + (member.paidAmount || 0),
      0
    );

    if (totalPaid !== amount) {
      return res.status(400).json({
        message: `The total paid amount (${totalPaid}) does not match the total expense amount (${amount}).`,
      });
    }

    if (splitType === "unequal") {
      let sum = 0;
      participants.forEach((p) => (sum += p.amount));
      if (sum !== amount) {
        return res.status(400).json({
          message: `The total paid amount (${amount}) does not match the unequal split amount (${sum}).`,
        });
      }
    }

    // Validate participants exist in the group
    const participantIds = participants.map((p) => p.memberId);
    const members = await GroupMember.find({
      groupId,
      _id: { $in: participantIds },
    });

    if (members.length !== participants.length) {
      return res.status(400).json({
        message: "Some participants are not valid members of the group.",
      });
    }

    // Calculate split amounts
    const splitAmount = [];
    const owesTo = [];
    const memberBalances = {};

    if (splitType === "equal") {
      const individualSplitAmount = parseFloat(
        (amount / participants.length).toFixed(2)
      );

      participants.forEach((member) => {
        splitAmount.push({
          memberId: member.memberId,
          memberName: member.name,
          amount: individualSplitAmount,
        });

        memberBalances[member.memberId] = -individualSplitAmount;
      });
    } else if (splitType === "unequal") {
      participants.forEach((p) => {
        splitAmount.push({
          memberId: p.memberId,
          memberName: p.name,
          amount: p.amount,
        });

        memberBalances[p.memberId] = -p.amount;
      });
    }

    participants.forEach((member) => {
      console.log("Participant member: ", member);
    });

    const expense = new Expense({
      groupId,
      description,
      amount,
      paidBy,
      participants,
      splitType,
      splitAmount,
      owesTo,
    });
    await expense.save();

    return res.status(200).json({
      message: "Expense added successfully.",
      expense,
    });
  } catch (error) {
    console.error("Error adding expense:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getAllGroupExpenses = async (req, res) => {
  const { groupId } = req.params;
  if (!groupId) {
    return res.status(400).json({ message: "Group id is required" });
  }
  try {
    const expenses = await Expense.find({ groupId }).populate("participants");
    if (!expenses) {
      return res.status(404).json({ message: "No expenses found" });
    }
    return res.status(200).json(expenses);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getExpense = async (req, res) => {
  const { expenseId } = req.params;
  if (!expenseId) {
    return res.status(400).json({ message: "Expense id is required" });
  }
  try {
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    return res.status(200).json(expense);
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong", error });
  }
};

const calculateGroupBalances = async (req, res) => {
  const { groupId } = req.params;

  if (!groupId) {
    return res.status(400).json({ message: "Group ID is required." });
  }

  try {
    const group = await Group.findById(groupId)
      .populate("settlement.creditor", "name") // Populate creditor's name
      .populate("settlement.member.memberId", "name"); // Populate member's name
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Reset settlement balances
    group.settlement.forEach((settlement) => {
      settlement.creditorAmount = 0;
      settlement.member.forEach((member) => {
        member.amount = 0;
      });
    });

    const groupExpenses = await Expense.find({ groupId });
    if (!groupExpenses.length) {
      return res
        .status(200)
        .json({ message: "No expenses found for this group." });
    }

    for (const expense of groupExpenses) {
      const { amount, participants, splitType, paidBy, splitAmount } = expense;

      for (const member of paidBy) {
        const paidMemberId = member.id.toString();
        const creditorMatch = group.settlement.find(
          (settlement) => settlement.creditor._id.toString() === paidMemberId
        );

        if (creditorMatch) {
          console.log("Creditor Found: ", creditorMatch);

          for (const debtor of creditorMatch.member) {
            const debtorMemberId = debtor.memberId._id.toString();

            const isDebtorPresent = participants.some(
              (participant) =>
                participant.memberId.toString() === debtorMemberId
            );
            if (isDebtorPresent) {
              const reverseMatch = group.settlement.find(
                (settlement) =>
                  settlement.creditor._id.toString() === debtorMemberId &&
                  settlement.member.some(
                    (m) => m.memberId._id.toString() === paidMemberId
                  )
              );

              if (reverseMatch) {
                const reverseMember = reverseMatch.member.find(
                  (m) => m.memberId._id.toString() === paidMemberId
                );

                if (reverseMember) {
                  let eachSplitAmount = 0;

                  if (splitType === "equal") {
                    eachSplitAmount = member.paidAmount / participants.length;
                  } else if (splitType === "unequal") {
                    const participant = splitAmount.find(
                      (p) => p.memberId.toString() === debtorMemberId
                    );

                    if (participant) {
                      let share = participant.amount / amount;
                      eachSplitAmount = member.paidAmount * share;
                    }
                  }

                  if (reverseMember.amount === eachSplitAmount) {
                    reverseMember.amount = 0;
                    debtor.amount = 0;
                  } else if (reverseMember.amount > eachSplitAmount) {
                    const excess = reverseMember.amount - eachSplitAmount;

                    reverseMember.amount = excess;
                    debtor.amount = 0;
                  } else if (reverseMember.amount < eachSplitAmount) {
                    const deficit = eachSplitAmount - reverseMember.amount;

                    reverseMember.amount = 0;
                    debtor.amount += deficit;
                  }
                }
              } else {
                console.log(
                  "Reverse Member Not present",
                  "paid member Id: ",
                  paidMemberId,
                  "reverse member Id: ",
                  debtorMemberId
                );
                // const findCreditor = group.settlement.find(
                //   (settlement) =>
                //     settlement.creditor._id.toString() === debtorMemberId
                // );
                // findCreditor.member.push({ memberId: paidMemberId, amount: 0 });
                // console.log(findCreditor);
              }
            } else {
              console.log("Debtor Not Found: ", debtorMemberId);
            }
          }
        }
      }
    }
    const groupMembers = await GroupMember.find({ groupId: groupId });

    groupMembers.forEach((member) => {
      member.borrows = 0;
      member.owes = 0;
    });

    group.settlement.forEach((settlement) => {
      let creditorAmount = 0;

      const creditorId = settlement.creditor._id;

      const creditorMember = groupMembers.find(
        (member) => member._id.toString() === creditorId.toString()
      );

      settlement.member.forEach((member) => {
        creditorAmount += member.amount;

        const debtorMember = groupMembers.find(
          (groupMember) =>
            groupMember._id.toString() === member.memberId._id.toString()
        );

        if (debtorMember) {
          debtorMember.owes += member.amount;
        }
      });

      settlement.creditorAmount = creditorAmount;
      if (creditorMember) {
        creditorMember.borrows += creditorAmount;
      }
    });

    console.log("Group Members after Calculation:", groupMembers);

    await group.save();

    for (const member of groupMembers) {
      await member.save();
    }

    res.status(200).json({
      message: "Group balances updated.",
      settlement: group.settlement,
    });
  } catch (error) {
    console.error("Error calculating group balances:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Example usage:

module.exports = {
  addExpense,
  getAllGroupExpenses,
  getExpense,
  calculateGroupBalances,
};
