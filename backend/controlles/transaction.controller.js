import Transaction from '../models/transaction.model.js';
import Person from '../models/person.model.js';
import updatePersonBalance from "../utils/updatePersonBalance.js"

// Add Entry (Give/Get)
export const addTransaction = async (req, res) => {
    try {
        const { personId, type, amount, note, date } = req.body;

        if (!personId || !type || !amount) {
            return res.status(400).json({ success: false, message: 'Person, Type, and Amount are required' });
        }

        const person = await Person.findOne({ _id: personId, userId: req.user._id });
        if (!person) {
            return res.status(404).json({ success: false, message: 'Person not found' });
        }

        // Schema field 'transactionDate' ko mapped kar do
        const transaction = await Transaction.create({
            userId: req.user._id,
            personId,
            type,
            amount: Number(amount),
            note,
            transactionDate: date ? new Date(date) : new Date(), // 👈 Field name matched to schema
        });

        const netBalance = await updatePersonBalance(personId);

        res.status(201).json({
            success: true,
            message: 'Transaction saved successfully',
            transaction,
            updatedNetBalance: netBalance,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// get all transaction of per user
export const getTransaction = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            userId: req.user._id
        })
            .populate("personId", "name") // Jo fields chahiye unhe select karein
            .sort({ updatedAt: -1 });

        if (!transactions || transactions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Transactions not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Transactions fetched successfully",
            entries: transactions
        });

    } catch (error) {
        console.error("Get Transactions Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// newelly 5 transactions
export const getTopTransaction = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            userId: req.user._id
        })
            .populate("personId", "name")
            .sort({ createdAt: -1 }).limit(5);

        if (!transactions || transactions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Transactions not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Transactions fetched successfully",
            entries: transactions
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


// Get Dashboard Overview Totals (Total Get, Total Give, Net Balance)
export const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Fetch total count of unique customers/persons
        const totalCustomers = await Person.countDocuments({ userId });

        // 2. Fetch all transactions for this user
        const transactions = await Transaction.find({ userId });

        let youWillGet = 0;
        let youWillGive = 0;

        transactions.forEach((t) => {
            const amount = Number(t.amount) || 0;
            if (t.type === 'get') {
                youWillGet += amount;
            } else if (t.type === 'give') {
                youWillGive += amount;
            }
        });

        const netTotal = youWillGet - youWillGive;

        return res.status(200).json({
            success: true,
            summary: {
                youWillGet,
                youWillGive,
                netTotal,
                totalCustomers,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// update transaction controller
export const updateTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { type, amount, note, date } = req.body;

        if (!type || !amount) {
            return res.status(400).json({ success: false, message: 'Type and Amount are required' });
        }

        const normalizedType = type.toLowerCase(); // Ensure 'get' or 'give' lowercase

        // Update fields matching Schema (handling both 'date' or 'transactionDate')
        const updateData = {
            type: normalizedType,
            amount: Number(amount),
            note,
        };

        if (date) {
            updateData.date = new Date(date); // Agar schema mein 'date' hai
            updateData.transactionDate = new Date(date); // Agar schema mein 'transactionDate' hai
        }

        const transaction = await Transaction.findOneAndUpdate(
            { _id: transactionId, userId: req.user._id },
            updateData,
            { returnDocument: 'after', runValidators: true }
        );

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        // Sync Net Balance across Person
        const netBalance = await updatePersonBalance(transaction.personId);

        return res.status(200).json({
            success: true,
            message: 'Transaction updated successfully',
            transaction,
            updatedNetBalance: netBalance,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
// Delete Transaction
export const deleteTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transaction = await Transaction.findOneAndDelete({
            _id: transactionId,
            userId: req.user._id,
        });

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        // Sync Net Balance
        const netBalance = await updatePersonBalance(transaction.personId);

        res.status(200).json({
            success: true,
            message: 'Transaction deleted successfully',
            updatedNetBalance: netBalance,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};