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

// const calculateGroupBalances = async (req, res) => {
//   // try {
//   //   const groupMembers = await GroupMember.find({ groupId });
//   //   if (!groupMembers.length) {
//   //     return res
//   //       .status(404)
//   //       .json({ message: "No members found for this group." });
//   //   }

//   //   const expenses = await Expense.find({ groupId });
//   //   if (!expenses.length) {
//   //     return res
//   //       .status(200)
//   //       .json({ message: "No expenses found for this group." });
//   //   }

//   //   const balances = groupMembers.reduce((acc, member) => {
//   //     acc[member._id] = { owes: 0, borrows: 0 };
//   //     return acc;
//   //   }, {});

//   //   expenses.forEach(async (expense) => {
//   //     const { splitAmount, paidBy, participants, splitType, amount } = expense;
//   //     splitAmount.forEach(({ memberId, amount }) => {
//   //       const memberPaid = paidBy.find(
//   //         (payer) => String(payer.id) === String(memberId)
//   //       );

//   //       const memberPaidAmount = memberPaid ? memberPaid.paidAmount : 0;

//   //       balances[memberId].owes += Math.max(amount - memberPaidAmount, 0);
//   //     });

//   //     paidBy.forEach(({ id: payerId, paidAmount }) => {
//   //       const payerSplit = splitAmount.find(
//   //         (split) => String(split.memberId) === String(payerId)
//   //       );
//   //       const payerOwes = payerSplit ? payerSplit.amount : 0;

//   //       balances[payerId].borrows += Math.max(paidAmount - payerOwes, 0);
//   //     });
//   //   });

//   //   const updatePromises = groupMembers.map((member) => {
//   //     const { owes, borrows } = balances[member._id];
//   //     return GroupMember.findByIdAndUpdate(
//   //       member._id,
//   //       { owes, borrows },
//   //       { new: true }
//   //     );
//   //   });
//   //   const updatedMembers = await Promise.all(updatePromises);

//   //   return res.status(200).json({
//   //     message: "Group balances calculated successfully.",
//   //     members: updatedMembers,
//   //   });
//   // } catch (error) {
//   //   console.error("Error calculating group balances:", error);
//   //   return res
//   //     .status(500)
//   //     .json({ message: "Server error", error: error.message });
//   // }
//   const { groupId } = req.params;

//   if (!groupId) {
//     return res.status(400).json({ message: "Group ID is required." });
//   }
//   try {
//     const group = await Group.findById(groupId);
//     console.log(group);

//     group.settlement.forEach((settlement) => {
//       // Set creditorAmount to 0
//       settlement.creditorAmount = 0;

//       // Iterate over each member and set their amount to 0
//       settlement.member.forEach((member) => {
//         member.amount = 0;
//       });
//     });
//     await group.save();

//     const groupExpenses = await Expense.find({ groupId });
//     let groupExpensesArray = [];
//     groupExpensesArray = groupExpenses;

//     groupExpensesArray.forEach((expense) => {
//       const { amount, participants, splitType, paidBy, splitAmount } = expense;
//       paidBy.forEach(async (member) => {
//         const paidMemberId = member.id;

//         const creditorMatch = group.settlement.find(
//           (settlement) => settlement.creditor.toString() === paidMemberId
//         );

//         if (creditorMatch) {
//           creditorMatch.member.forEach((debtor) => {
//             const debtorMemberId = debtor.memberId.toString();

//             const reverseMatch = group.settlement.find(
//               (settlement) =>
//                 settlement.creditor.toString() === debtorMemberId &&
//                 settlement.member.some(
//                   (m) => m.memberId.toString() === paidMemberId
//                 )
//             );

//             if (reverseMatch) {
//               const reverseMember = reverseMatch.member.find(
//                 (m) => m.memberId.toString() === paidMemberId
//               );

//               if (reverseMember) {
//                 let eachSplitAmount = 0;
//                 if (splitType === "equal") {
//                   eachSplitAmount = member.paidAmount / participants.length;
//                 } else if (splitType === "unequal") {
//                   splitAmount.forEach((participant) => {
//                     console.log("p Member Id: ", participant.memberId);
//                     console.log("debtor Member Id: ", debtorMemberId);

//                     if (participant.memberId === debtorMemberId) {
//                       let share = participant.amount / amount;

//                       eachSplitAmount = member.paidAmount * share;
//                     }
//                   });
//                 }

//                 if (reverseMember.amount === eachSplitAmount) {
//                   reverseMember.amount = 0;
//                   debtor.amount = 0;
//                 } else if (reverseMember.amount > eachSplitAmount) {
//                   const excess = reverseMember.amount - eachSplitAmount;

//                   reverseMember.amount = excess;
//                   debtor.amount = 0;
//                 } else if (reverseMember.amount < eachSplitAmount) {
//                   const deficit = eachSplitAmount - reverseMember.amount;

//                   reverseMember.amount = 0;
//                   debtor.amount = deficit;
//                 }
//               }
//             } else {
//             }
//           });
//         } else {
//         }
//       });
//     });

//     await group.save();

//     res.status(200).json({ group: group.settlement });
//   } catch (error) {}
// };
const calculateGroupBalances = async (req, res) => {
  const { groupId } = req.params;

  if (!groupId) {
    return res.status(400).json({ message: "Group ID is required." });
  }

  try {
    const group = await Group.findById(groupId);
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
          (settlement) => settlement.creditor.toString() === paidMemberId
        );

        if (creditorMatch) {
          for (const debtor of creditorMatch.member) {
            const debtorMemberId = debtor.memberId.toString();

            const isDebtorPresent = participants.some(
              (participant) =>
                participant.memberId.toString() === debtorMemberId
            );
            if (isDebtorPresent) {
              const reverseMatch = group.settlement.find(
                (settlement) =>
                  settlement.creditor.toString() === debtorMemberId &&
                  settlement.member.some(
                    (m) => m.memberId.toString() === paidMemberId
                  )
              );

              if (reverseMatch) {
                const reverseMember = reverseMatch.member.find(
                  (m) => m.memberId.toString() === paidMemberId
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
                      //
                    }
                  }

                  // Adjust the amounts based on the reverseMember's amount and the calculated split
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
    }

    group.settlement.forEach((settlement) => {
      let creditorAmount = 0;

      console.log(settlement.creditor);

      settlement.member.forEach((member) => {
        creditorAmount += member.amount;
      });
      settlement.creditorAmount = creditorAmount;
    });

    await group.save();
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
