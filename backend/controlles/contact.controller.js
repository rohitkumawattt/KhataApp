import Contact from "../models/contact.model.js";
import User from "../models/user.model.js";


// create send msg controller
export const sendMessage = async (req, res) => {
    try {
        const { name, message, subject } = req.body;
        if (!name || !message || !subject) {
            return res.status(400).json({ success: false, error: "All fields are required" });
        }
        const findUser = await User.findById(req.userId);

        if (!findUser) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        const contact = await Contact.create({
            userId: req.userId,
            name,
            email: findUser.email,
            message,
            subject
        })
        return res.status(201).json({ success: true, message: "Message sent successfully", contact });
    } catch (error) {
        // console.log("error from send message controller " + error.message);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}

// get all contacts controller
export const getAllContacts = async (req, res) => {
    try {
        const allMsg = await Contact.find();

        return res.status(200).json({ success: true, message: "Messages fetched successfully", allMsg });
    } catch (error) {
        // console.log("error from get all contacts controller " + error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

// get msg by user
export const getUserContact = async (req, res) => {
    try {
        const userCont = await Contact.find({ userId: req.userId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, message: "Messages fetched successfully", userCont });
    } catch (error) {
        // console.log("error from get user contact controller " + error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// update user contact msg
export const updateContactMsg = async (req, res) => {
    try {
        const { _id } = req.params;

        const { name, message, subject } = req.body;
        if (!name || !message || !subject) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const findUser = await User.findById(req.userId);

        if (!findUser) {
            return res.status(404).json({ error: "User not found" });
        }
        const contact = await Contact.findByIdAndUpdate(_id, {
            name,
            email: findUser.email,
            message,
            subject
        }, { new: true });
        return res.status(200).json({ success: true, message: "Message updated successfully", contact });
    } catch (error) {
        // console.log("error from update contact msg controller " + error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

// delate contact msg
export const deleteContactMSg = async (req, res) => {
    try {
        const { _id } = req.params;
        await Contact.findByIdAndDelete(_id);
        return res.status(200).json({ success: true, message: "Message deleted successfully" });
    } catch (error) {
        // console.log("error from delete contact msg controller " + error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
