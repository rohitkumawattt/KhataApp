import express from "express";
const router = express.Router();
import { addTransaction, getTransaction, getDashboardSummary, deleteTransaction, getTopTransaction, updateTransaction } from "../controlles/transaction.controller.js";
import protect from "../middleware/auth.middleware.js";

router.post("/add", protect, addTransaction);
router.get("/", protect, getTransaction);
router.get("/summery", protect, getDashboardSummary);
router.delete("/delete/:transactionId", protect, deleteTransaction);
router.get("/top", protect, getTopTransaction);
router.put("/update/:transactionId", protect, updateTransaction);

export default router
