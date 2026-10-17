import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    phone: {
        type: String,
        default: null,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        require: true,
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
    refreshToken: {
        type: String,
        default: null,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },

    emailVerificationToken: {
        type: String,
        default: null,
    },

    emailVerificationExpires: {
        type: Date,
        default: null,
    },
    passwordResetToken: {
        type: String,
        default: null,
    },

    passwordResetExpires: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true
});


const User = mongoose.model("User", userSchema);
export default User;