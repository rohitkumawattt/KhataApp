import Person from "../models/person.model.js";
import Transaction from "../models/transaction.model.js";

const updatePersonBalance = async (personId) => {
    const transactions = await Transaction.find({ personId });

    let totalGet = 0;
    let totalGive = 0;

    transactions.forEach((tx) => {
        const type = tx.type ? tx.type.toLowerCase() : '';
        const amount = Number(tx.amount) || 0;

        if (type === 'get') {
            totalGet += amount;
        } else if (type === 'give') {
            totalGive += amount;
        }
    });

    const netBalance = totalGet - totalGive;

    // Database me exact values sync karo
    await Person.findByIdAndUpdate(
        personId,
        {
            totalGet,
            totalGive,
            netBalance,
        },
        { returnDocument: 'after' }
    );

    return { totalGet, totalGive, netBalance };
};

export default updatePersonBalance;