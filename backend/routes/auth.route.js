import express from "express";
import {
    registerUser,
    sendEmailVerificationOtp,
    resendEmailVerificationOtp,
    verifyEmailOtp,
    loginUser,
    forgotPassword,
    verifyPasswordResetOtp,
    resetPassword,
    refreshAccessToken,
    logoutUser,
    getCurrentUser,
    profile,
    updateProfile,
    removeProfileImage,
    changePassword
} from "../controlles/auth.controller.js";
import protect from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { authRateLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

// Registration & Email Verification
router.post("/register", upload.single("profileImage"), registerUser);
router.post("/send-verification-otp", authRateLimiter, sendEmailVerificationOtp);
router.post("/resend-verification-otp", authRateLimiter, resendEmailVerificationOtp);
router.post("/verify-email", verifyEmailOtp);

// Authentication
router.post("/login", authRateLimiter, loginUser);
router.post("/refresh-token", refreshAccessToken);

// Password Reset Flow
router.post("/forgot-password", authRateLimiter, forgotPassword);
router.post("/verify-reset-otp", authRateLimiter, verifyPasswordResetOtp);
router.post("/reset-password", authRateLimiter, resetPassword);

// Protected routes
router.get("/me", protect, getCurrentUser);
router.get("/profile", protect, profile);
router.post("/logout", protect, logoutUser);

// Profile Update & Image Operations (Cloudinary Integration)
router.put("/update-profile", protect, upload.single("profileImage"), updateProfile);
router.delete("/remove-profile-image", protect, removeProfileImage);
router.post("/change-password", protect, changePassword);

export default router;