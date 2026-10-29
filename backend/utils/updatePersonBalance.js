import mongoose from "mongoose";
import Person from "../models/person.model.js";
import Transaction from "../models/transaction.model.js";

const updatePersonBalance = async (personId) => {
    try {
        const pId = new mongoose.Types.ObjectId(personId);

        const stats = await Transaction.aggregate([
            {
                $match: {
                    personId: pId,
                    isSettled: { $ne: true }
                }
            },
            {
                $group: {
                    _id: null,
                    totalGet: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "get"] }, "$amount", 0]
                        }
                    },
                    totalGive: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "give"] }, "$amount", 0]
                        }
                    }
                }
            }
        ]);

        const totalGet = stats.length > 0 ? stats[0].totalGet : 0;
        const totalGive = stats.length > 0 ? stats[0].totalGive : 0;
        const netBalance = totalGet - totalGive;

        // Person document ko update karo updated values ke sath
        const updatedPerson = await Person.findByIdAndUpdate(
            personId,
            {
                totalGet,
                totalGive,
                netBalance,
            },
            { new: true }
        );

        return { totalGet, totalGive, netBalance, updatedPerson };
    } catch (error) {
        console.error("Error updating person balance:", error);
        throw error;
    }
};

export default updatePersonBalance;