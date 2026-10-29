import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    personId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person',
        required: true,
        index: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['get', 'give'],
        required: true,
    },
    isSettled: {
        type: Boolean,
        default: false,
    },
    settledDate: {
        type: Date,
        default: Date.now,
    },
    note: {
        type: String,
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;