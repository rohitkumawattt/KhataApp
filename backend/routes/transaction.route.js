import express from "express";
const router = express.Router();
import { addTransaction, getTransaction, getDashboardSummary, settledTransaction, getTopTransaction, updateTransaction, getSettledTransaction } from "../controlles/transaction.controller.js";
import protect from "../middleware/auth.middleware.js";

router.post("/add", protect, addTransaction);
router.get("/", protect, getTransaction);
router.get("/summery", protect, getDashboardSummary);
router.put("/settled/:transactionId", protect, settledTransaction);
router.get("/settled", protect, getSettledTransaction);
router.get("/top", protect, getTopTransaction);
router.put("/update/:transactionId", protect, updateTransaction);

export default router
