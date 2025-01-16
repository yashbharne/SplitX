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
    const message = await calculateBalances(expense, groupId);

    return res.status(200).json({
      message: "Expense added successfully.",
      expense,
      settlement: message,
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

const settleBalance = async (req, res) => {
  console.log(req.body);

  const { groupId, amount, creditorId, debtorId } = req.body.data;

  console.log(
    "groupId: ",
    groupId,
    "amount: ",
    amount,
    "creditorId: ",
    creditorId,
    "debtorId: ",
    debtorId
  );

  if (!amount || !creditorId || !debtorId || !groupId) {
    return res.status(400).json({
      message: "Amount, creditorId, debtorId, and groupId are required",
    });
  }

  try {
    // Ensure all IDs are ObjectIds
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(400).json({ message: "Group not found" });
    }

    // Add transaction
    group.paidTransaction.push({
      creditorId: creditorId,
      debtorId: debtorId,
      amount,
    });

    const settlementEntry = group.settlement.find(
      (entry) => entry.creditor.toString() === creditorId
    );

    if (!settlementEntry) {
      return res
        .status(400)
        .json({ message: "Creditor not found in settlement" });
    }

    // Filter the member array to find the specific debtor
    const debtorEntry = settlementEntry.member.find(
      (m) => m.memberId.toString() === debtorId
    );

    if (!debtorEntry) {
      return res
        .status(400)
        .json({ message: "Debtor not found in member array" });
    }

    settlementEntry.creditorAmount -= amount;
    debtorEntry.amount -= amount;

    //Save the group after changes
    await group.save();

    return res.status(200).json({ message: "Balance settled successfully" });
  } catch (error) {
    console.error("Error in settleBalance:", error);
    return res
      .status(500)
      .json({ message: `Something went wrong: ${error.message}` });
  }
};

const getGroupBalance = async (req, res) => {
  const { groupId } = req.params;
  if (!groupId) {
    return res.status(400).json({ message: "Group ID is required" });
  }
  try {
    const group = await Group.findById(groupId)
      .populate("settlement.creditor", "name") // Populate creditor's name
      .populate("settlement.member.memberId", "name"); // Populate member's name;
    if (!group) {
      return res.status(400).json({ message: "Group not found" });
    }
    console.log(group);

    return res.status(200).json({
      settlement: group.settlement,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error: ", error });
  }
};

const updateExpense = async (req, res) => {
  const {
    groupId,
    description,
    amount,
    participants,
    splitType,
    paidBy,
    expenseId,
  } = req.body;

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
    // Fetch the existing expense
    const existingExpense = await Expense.findById(expenseId);
    if (!existingExpense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    existingExpense.paidBy.forEach((memberPaid) => {
      const payerId = memberPaid.id;
      console.log("PayerID ", payerId);

      const payerMatchInGroup = group.settlement.find(
        (member) => member.creditor.toString() === payerId.toString()
      );
      console.log(payerMatchInGroup);
      if (payerMatchInGroup) {
        if (existingExpense.splitType === "equal") {
          payerMatchInGroup.member.forEach((member) => {
            const split =
              memberPaid.paidAmount / existingExpense.participants.length;
            if (
              member.memberId.toString() !==
              payerMatchInGroup.creditor.toString()
            ) {
              payerMatchInGroup.creditorAmount -= member.amount;
              member.amount -= split;
              if (member.amount < 0) {
                const reverseCreditor = group.settlement.find(
                  (revCred) =>
                    revCred.creditor.toString() === member.memberId.toString()
                );
                if (reverseCreditor) {
                  reverseCreditor.creditorAmount += -member.amount;
                  const revDebtor = reverseCreditor.member.find(
                    (revDebt) =>
                      revDebt.memberId.toString() ===
                      payerMatchInGroup.creditor.toString()
                  );
                  if (revDebtor) {
                    revDebtor.amount += -member.amount;
                  }
                }
                member.amount = 0;
              }
            }
          });
          console.log("After calculation: ", payerMatchInGroup);
        } else if (existingExpense.splitType === "unequal") {
          payerMatchInGroup.member.forEach((member) => {
            let share = member.amount / existingExpense.amount;
            const split = memberPaid.paidAmount * share;
            if (
              member.memberId.toString() !==
              payerMatchInGroup.creditor.toString()
            ) {
              payerMatchInGroup.creditorAmount -= member.amount;
              member.amount -= split;
              if (member.amount < 0) {
                const reverseCreditor = group.settlement.find(
                  (revCred) =>
                    revCred.creditor.toString() === member.memberId.toString()
                );
                if (reverseCreditor) {
                  reverseCreditor.creditorAmount += -member.amount;
                  const revDebtor = reverseCreditor.member.find(
                    (revDebt) =>
                      revDebt.memberId.toString() ===
                      payerMatchInGroup.creditor.toString()
                  );
                  if (revDebtor) {
                    revDebtor.amount += -member.amount;
                  }
                }
                member.amount = 0;
              }
            }
          });
          console.log("After calculation: ", payerMatchInGroup);
        }
      }
    });

    await group.save();

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

    // Update the existing expense with new data
    existingExpense.groupId = groupId;
    existingExpense.description = description;
    existingExpense.amount = amount;
    existingExpense.paidBy = paidBy;
    existingExpense.participants = participants;
    existingExpense.splitType = splitType;
    existingExpense.splitAmount = splitAmount;

    // Save the updated expense
    await existingExpense.save();

    // Recalculate balances
    const message = await calculateBalances(existingExpense, groupId);

    return res.status(200).json({
      message: "Expense updated successfully.",
      expense: existingExpense,
      settlement: message,
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

async function calculateBalances(expense, groupId) {
  const groupExpenses = expense;

  if (!groupId) {
    return { message: "Group ID is required." };
  }

  try {
    const group = await Group.findById(groupId)
      .populate("settlement.creditor", "name") // Populate creditor's name
      .populate("settlement.member.memberId", "name"); // Populate member's name
    if (!group) {
      return { message: "Group not found." };
    }

    const { amount, participants, splitType, paidBy, splitAmount } =
      groupExpenses;

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
            } else {
              console.log(
                "Reverse Member Not present",
                "paid member Id: ",
                paidMemberId,
                "reverse member Id: ",
                debtorMemberId
              );
            }
          } else {
            console.log("Debtor Not Found: ", debtorMemberId);
          }
        }
      }
    }

    const groupMembers = group.members;

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
  } catch (error) {
    console.error("Error calculating group balances:", error);
    return { message: "Server error", error: error.message };
  }
}

const deleteExpense = async (req, res) => {
  const { expenseId } = req.params;
  if (!expenseId) {
    return res.status(400).json({ message: "expenseId Is required" });
  }
  try {
    const existingExpense = await Expense.findById(expenseId);
    if (!existingExpense) {
      return res.status(404).json({ message: "Expense not found." });
    }
    const group = await Group.findById(existingExpense.groupId);
    existingExpense.paidBy.forEach((memberPaid) => {
      const payerId = memberPaid.id;
      console.log("PayerID ", payerId);

      const payerMatchInGroup = group.settlement.find(
        (member) => member.creditor.toString() === payerId.toString()
      );
      console.log(payerMatchInGroup);
      if (payerMatchInGroup) {
        if (existingExpense.splitType === "equal") {
          payerMatchInGroup.member.forEach((member) => {
            const split =
              memberPaid.paidAmount / existingExpense.participants.length;
            if (
              member.memberId.toString() !==
              payerMatchInGroup.creditor.toString()
            ) {
              payerMatchInGroup.creditorAmount -= member.amount;
              member.amount -= split;
              if (member.amount < 0) {
                const reverseCreditor = group.settlement.find(
                  (revCred) =>
                    revCred.creditor.toString() === member.memberId.toString()
                );
                if (reverseCreditor) {
                  reverseCreditor.creditorAmount += -member.amount;
                  const revDebtor = reverseCreditor.member.find(
                    (revDebt) =>
                      revDebt.memberId.toString() ===
                      payerMatchInGroup.creditor.toString()
                  );
                  if (revDebtor) {
                    revDebtor.amount += -member.amount;
                  }
                }
                member.amount += member.amount;
              }
            }
          });
          console.log("After calculation: ", payerMatchInGroup);
        } else if (existingExpense.splitType === "unequal") {
          payerMatchInGroup.member.forEach((member) => {
            let share = member.amount / existingExpense.amount;
            const split = memberPaid.paidAmount * share;
            if (
              member.memberId.toString() !==
              payerMatchInGroup.creditor.toString()
            ) {
              payerMatchInGroup.creditorAmount -= member.amount;
              member.amount -= split;
              if (member.amount < 0) {
                const reverseCreditor = group.settlement.find(
                  (revCred) =>
                    revCred.creditor.toString() === member.memberId.toString()
                );
                if (reverseCreditor) {
                  reverseCreditor.creditorAmount += -member.amount;
                  const revDebtor = reverseCreditor.member.find(
                    (revDebt) =>
                      revDebt.memberId.toString() ===
                      payerMatchInGroup.creditor.toString()
                  );
                  if (revDebtor) {
                    revDebtor.amount += -member.amount;
                  }
                }
                member.amount += member.amount;
              }
            }
          });
          console.log("After calculation: ", payerMatchInGroup);
        }
      }
    });

    await group.save();
    const deleteExpense = await Expense.findByIdAndDelete(expenseId);
    if (!deleteExpense) {
      return res
        .status(400)
        .json({ message: "Something went wrong while deleting" });
    }
    return res.status(200).json({ message: "Expense Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong: ", error });
  }
};

module.exports = {
  addExpense,
  getAllGroupExpenses,
  getExpense,
  updateExpense,
  settleBalance,
  getGroupBalance,
  deleteExpense,
};
