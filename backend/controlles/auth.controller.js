import User from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import { generateOTP } from "../utils/generateOtp.js";
import { sendOtpEmail } from "../utils/sendMail.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

export const sendEmailVerificationOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified",
            });
        }

        const otp = generateOTP();
        const hashedOtp = await bcrypt.hash(otp, 10);

        user.emailVerificationToken = hashedOtp;
        user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await user.save();

        await sendOtpEmail({
            email: user.email,
            name: user.name || "User",
            otp,
            purpose: "email-verification",
        });

        return res.status(200).json({
            success: true,
            message: "Verification OTP sent to your email",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to send verification OTP",
        });
    }
};

export const resendEmailVerificationOtp = async (req, res) => {
    return sendEmailVerificationOtp(req, res);
};


export const verifyEmailOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.isEmailVerified) {
            return res.status(200).json({
                success: true,
                message: "Email is already verified",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    profileImage: user.profileImage,
                    isEmailVerified: true,
                },
            });
        }

        if (!user.emailVerificationToken || !user.emailVerificationExpires) {
            return res.status(400).json({
                success: false,
                message: "No OTP request found. Please request a new OTP.",
            });
        }

        if (new Date() > new Date(user.emailVerificationExpires)) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one.",
            });
        }

        const isOtpValid = await bcrypt.compare(otp.toString().trim(), user.emailVerificationToken);
        if (!isOtpValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        user.refreshToken = await bcrypt.hash(refreshToken, 10);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profileImage: user.profileImage,
                isEmailVerified: true,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to verify OTP",
        });
    }
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        let user = await User.findOne({ email: normalizedEmail });

        if (user && user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered",
            });
        }

        // Handle Profile Image Upload if provided during registration
        let imageObj = { url: "", public_id: "" };

        if (req.file) {
            // console.log("📸 Profile image received:", req.file.originalname, req.file.mimetype, req.file.size, "bytes");
            try {
                const uploadRes = await uploadToCloudinary(req.file.buffer, "khataApp/profiles");
                imageObj = { url: uploadRes.secure_url, public_id: uploadRes.public_id };
                // console.log("✅ Cloudinary upload success:", imageObj.url);
            } catch (uploadError) {
                // console.error("❌ Cloudinary upload failed:", uploadError.message || uploadError);
                // Registration continue karega bina image ke
            }
        } else {
            // console.log("⚠️ No profile image file received in req.file");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        if (user && !user.isEmailVerified) {
            // Delete old profile image if existed before replacing
            if (user.profileImage && user.profileImage.public_id && req.file) {
                await deleteFromCloudinary(user.profileImage.public_id);
            }

            user.name = name.trim();
            user.password = hashedPassword;
            if (req.file) user.profileImage = imageObj;
            user.emailVerificationToken = hashedOtp;
            user.emailVerificationExpires = otpExpires;
            await user.save();
        } else {
            // Create new user
            user = await User.create({
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                profileImage: imageObj,
                isEmailVerified: false,
                emailVerificationToken: hashedOtp,
                emailVerificationExpires: otpExpires,
            });
        }

        // Send OTP email
        try {
            await sendOtpEmail({
                email: user.email,
                name: user.name,
                otp,
                purpose: "email-verification",
            });
        } catch (mailError) {
            console.error("Error sending verification email:", mailError);
        }

        return res.status(201).json({
            success: true,
            message: "Registration successful. Please verify your email with the OTP sent to your inbox.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profileImage: user.profileImage,
                isEmailVerified: false,
            },
        });
    } catch (error) {
        // console.log("REGISTRATION ERROR: ", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Registration failed",
        });
    }
};


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        user.refreshToken = await bcrypt.hash(refreshToken, 10);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profileImage: user.profileImage,
                isEmailVerified: user.isEmailVerified,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Login failed",
        });
    }
};


export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address",
            });
        }

        const otp = generateOTP();
        const hashedOtp = await bcrypt.hash(otp, 10);

        user.passwordResetToken = hashedOtp;
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await user.save();

        await sendOtpEmail({
            email: user.email,
            name: user.name || "User",
            otp,
            purpose: "password-reset",
        });

        return res.status(200).json({
            success: true,
            message: "Password reset OTP sent to your email",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to send reset OTP",
        });
    }
};


export const verifyPasswordResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.passwordResetToken || !user.passwordResetExpires) {
            return res.status(400).json({
                success: false,
                message: "No password reset request found. Please request a new OTP.",
            });
        }

        if (new Date() > new Date(user.passwordResetExpires)) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one.",
            });
        }

        const isOtpValid = await bcrypt.compare(otp.toString().trim(), user.passwordResetToken);
        if (!isOtpValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully. You can now reset your password.",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to verify reset OTP",
        });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, password } = req.body;
        const finalPassword = newPassword || password;

        if (!email || !otp || !finalPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP and new password are required",
            });
        }

        if (finalPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.passwordResetToken || !user.passwordResetExpires) {
            return res.status(400).json({
                success: false,
                message: "No password reset request found or OTP already used",
            });
        }

        if (new Date() > new Date(user.passwordResetExpires)) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one.",
            });
        }

        const isOtpValid = await bcrypt.compare(otp.toString().trim(), user.passwordResetToken);
        if (!isOtpValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        const hashedPassword = await bcrypt.hash(finalPassword, 10);
        user.password = hashedPassword;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        user.refreshToken = null; // Logout from other sessions for security
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful. Please login with your new password.",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to reset password",
        });
    }
};


export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required",
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token",
            });
        }

        const user = await User.findById(decoded.userId);
        if (!user || !user.refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        const isValidRefreshToken = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isValidRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        const newAccessToken = generateAccessToken(user._id);
        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            accessToken: newAccessToken,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to refresh token",
        });
    }
};

export const logoutUser = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : req.userId;
        const user = await User.findById(userId);
        if (user) {
            user.refreshToken = null;
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Logout failed",
        });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : req.userId;
        const user = await User.findById(userId).select("-password -refreshToken -emailVerificationToken -passwordResetToken");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Current user data retrieved successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profileImage: user.profileImage,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch user data",
        });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, phone } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // 1. If a new image file is uploaded via Multer
        if (req.file) {
            // console.log(req.file)
            // Delete existing profile image from Cloudinary if public_id exists
            if (user.profileImage && user.profileImage.public_id) {
                await deleteFromCloudinary(user.profileImage.public_id);
            }

            // Upload new file to Cloudinary
            const uploadRes = await uploadToCloudinary(req.file.buffer, "khataApp/profiles");
            // console.log("SUCCESSFULLY UPLOADED TO CLOUDINARY:", uploadRes);
            user.profileImage = {
                url: uploadRes.secure_url,
                public_id: uploadRes.public_id,
            };
        }

        if (name) user.name = name.trim();
        if (phone !== undefined) user.phone = phone.trim();

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profileImage: user.profileImage,
                isEmailVerified: user.isEmailVerified,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const removeProfileImage = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : req.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.profileImage && user.profileImage.public_id) {
            await deleteFromCloudinary(user.profileImage.public_id);
            user.profileImage = { url: "", public_id: "" };
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: "Profile image removed successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profileImage: user.profileImage,
                isEmailVerified: user.isEmailVerified,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to remove profile image",
        });
    }
};

// Change Password (for logged-in user)
export const changePassword = async (req, res) => {
    try {
        const userId = req.user ? req.user._id : req.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Verify old password
        const isPasswordMatched = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordMatched) {
            return res.status(400).json({
                success: false,
                message: "Incorrect current password",
            });
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully!",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Profile alias for backward compatibility
export const profile = getCurrentUser;