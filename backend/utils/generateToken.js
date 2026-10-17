import jwt from "jsonwebtoken"

export const generateAccessToken = (userId) => {
    return jwt.sign({ userId: userId.toString() }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES });
};

export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId: userId.toString() }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES });
};

