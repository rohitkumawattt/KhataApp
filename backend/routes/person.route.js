import express from "express";
const router = express.Router();
import protect from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
    addPerson,
    getAllPerson,
    getSinglePerson,
    updatePerson,
    deletePerson,
} from "../controlles/person.controller.js";

// person routes
router.post("/add", protect, upload.single("profileImage"), addPerson);
router.get("/", protect, getAllPerson);
router.get("/:personId", protect, getSinglePerson);
router.put("/update/:personId", protect, upload.single("profileImage"), updatePerson);
router.delete("/delete/:personId", protect, deletePerson);

export default router