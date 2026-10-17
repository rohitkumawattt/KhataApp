import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import morgan from "morgan"
import authRouters from "./routes/auth.route.js";
import personRouters from "./routes/person.route.js"
import transactionRouter from "./routes/transaction.route.js"
import contactRouter from "./routes/contact.route.js"
import { generalRateLimiter } from "./middleware/rateLimiter.middleware.js";
const app = express()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
// server.js ke top par app initialization ke baad
app.set('trust proxy', 1);
const port = process.env.PORT


app.get("/", (req, res) => {
    res.send("Hello World!")
})

// database connect function
connectDB();

// generate ratelimit.
app.use("/api", generalRateLimiter)

// auth route 
app.use("/api/auth", authRouters);

// person route
app.use("/api/persons", personRouters);

// transaction route
app.use("/api/transaction", transactionRouter);

// contact route
app.use("/api/contact", contactRouter);


app.listen(port, '0.0.0.0', () => {
    console.log(`Backend server running on https://khataapp-backend-0uuc.onrender.com/`)
})