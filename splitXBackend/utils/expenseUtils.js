const Group = require("../models/groups.model.js");
const GroupMember = require("../models/groupMembers.models.js");
const Expense = require("../models/groupExpense.models.js");

const validateExpenseInput = (
  groupId,
  description,
  amount,
  participants,
  splitType,
  paidBy
) => {
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
    throw new Error("All fields are required and must be valid.");
  }

  if (isNaN(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }
};

const validateTotalPaidAmount = (paidBy, amount) => {
  const totalPaid = paidBy.reduce((sum, member) => sum + (member.paidAmount || 0), 0);
  if (totalPaid !== amount) {
    throw new Error(`The total paid amount (${totalPaid}) does not match the total expense amount (${amount}).`);
  }
};

const validateUnequalSplit = (participants, amount) => {
  let sum = 0;
  participants.forEach((p) => (sum += p.amount));
  if (sum !== amount) {
    throw new Error(`The total paid amount (${amount}) does not match the unequal split amount (${sum}).`);
  }
};

const validateParticipants = async (groupId, participants) => {
  const participantIds = participants.map((p) => p.memberId);
  const members = await GroupMember.find({
    groupId,
    _id: { $in: participantIds },
  });

  if (members.length !== participants.length) {
    throw new Error("Some participants are not valid members of the group.");
  }
};

const calculateSplitAmounts = (
  participants,
  amount,
  splitType
) => {
  const splitAmount = [];
  const memberBalances = {};

  if (splitType === "equal") {
    const individualSplitAmount = parseFloat((amount / participants.length).toFixed(2));
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

  return { splitAmount, memberBalances };
};

const updateGroupSettlement = async (
  groupId,
  expense
) => {
  const group = await Group.findById(groupId)
    .populate("settlement.creditor", "name")
    .populate("settlement.member.memberId", "name");

  if (!group) {
    throw new Error("Group not found.");
  }

  const { amount, participants, splitType, paidBy, splitAmount } = expense;

  for (const member of paidBy) {
    const paidMemberId = member.id.toString();
    const creditorMatch = group.settlement.find(
      (settlement) => settlement.creditor._id.toString() === paidMemberId
    );

    if (creditorMatch) {
      for (const debtor of creditorMatch.member) {
        const debtorMemberId = debtor.memberId._id.toString();
        const isDebtorPresent = participants.some(
          (participant) => participant.memberId.toString() === debtorMemberId
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
          }
        }
      }
    }
  }

  group.settlement.forEach((settlement) => {
    let creditorAmount = 0;
    settlement.member.forEach((member) => {
      creditorAmount += member.amount;
    });
    settlement.creditorAmount = creditorAmount;
  });

  await group.save();

  return {
    message: "Group balances updated.",
    settlement: group.settlement,
  };
};

module.exports = {
  validateExpenseInput,
  validateTotalPaidAmount,
  validateUnequalSplit,
  validateParticipants,
  calculateSplitAmounts,
  updateGroupSettlement
};

