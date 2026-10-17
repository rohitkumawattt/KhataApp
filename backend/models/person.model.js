import mongoose from "mongoose"

const personSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
        default: '',
    },
    address: {
        type: String,
        trim: true,
        default: '',
    },
    profileImage: {
        url: {
            type: String,
            default: ''
        },
        public_id: {
            type: String,
            default: ''
        },
    },
    // Total Lena Hai
    totalGet: {
        type: Number,
        default: 0,
    },
    // Total Dena Hai
    totalGive: {
        type: Number,
        default: 0,
    },
    netBalance: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true
});

const Person = mongoose.model("Person", personSchema);
export default Person;