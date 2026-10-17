import express from "express";
import protect from "../middleware/auth.middleware.js";
import { sendMessage, getAllContacts, getUserContact, updateContactMsg, deleteContactMSg } from "../controlles/contact.controller.js";
const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/all", protect, getAllContacts);
router.get("/messages", protect, getUserContact);
router.put("/update/:_id", protect, updateContactMsg);
router.delete("/delete/:_id", protect, deleteContactMSg);

export default router;
