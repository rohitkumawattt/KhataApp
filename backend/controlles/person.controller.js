import Person from "../models/person.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import Transaction from "../models/transaction.model.js";

// Add new person 
export const addPerson = async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        // 1. Validate name
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        const trimmedName = name.trim();
        const trimmedPhone = phone?.trim() || "";
        const trimmedAddress = address?.trim() || "";

        // Escape special regex characters
        const escapedName = trimmedName.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        // 2. Check duplicate person
        const existingPersonQuery = {
            userId: req.user._id,
            $or: [
                {
                    name: {
                        $regex: `^${escapedName}$`,
                        $options: "i"
                    }
                }
            ]
        };

        // Check phone only if provided
        if (trimmedPhone) {
            existingPersonQuery.$or.push({
                phone: trimmedPhone
            });
        }

        const existingPerson = await Person.findOne(existingPersonQuery);

        if (existingPerson) {
            const isNameMatch =
                existingPerson.name.toLowerCase() ===
                trimmedName.toLowerCase();

            return res.status(400).json({
                success: false,
                message: isNameMatch
                    ? "A person with this name already exists in your Khata."
                    : "A person with this phone number already exists in your Khata."
            });
        }

        // 3. Upload profile image to Cloudinary
        let image = {
            url: "",
            public_id: ""
        };

        if (req.file) {
            const uploadResult = await uploadToCloudinary(
                req.file.buffer,
                "khataApp/persons"
            );

            image = {
                url: uploadResult.secure_url,
                public_id: uploadResult.public_id
            };
        }

        // 4. Create person
        const person = new Person({
            userId: req.user._id,
            name: trimmedName,
            phone: trimmedPhone,
            address: trimmedAddress,
            profileImage: image
        });

        // 5. Save person
        await person.save();

        // 6. Response
        return res.status(201).json({
            success: true,
            message: "Person added successfully",
            person
        });

    } catch (error) {
        console.error("Add Person Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to add person"
        });
    }
};

// get all person
export const getAllPerson = async (req, res) => {
    try {
        const { search, filter } = req.query;
        let query = { userId: req.user._id };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        if (filter === 'GET') {
            query.netBalance = { $gt: 0 };
        } else if (filter === 'GIVE') {
            query.netBalance = { $lt: 0 };
        } else if (filter === 'SETTLED') {
            query.netBalance = 0;
        }

        const persons = await Person.find(query).sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Persons fetched successfully",
            count: persons.length,
            persons
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch persons"
        });
    }
}

// get single person
export const getSinglePerson = async (req, res) => {
    try {
        const { personId } = req.params;
        const person = await Person.findOne({
            _id: personId,
            userId: req.user._id,
        });

        if (!person) {
            return res.status(404).json({ success: false, message: 'Person not found' });
        }

        const transactions = await Transaction.find({ personId: person._id }).sort({ transactionsdate: -1 });

        return res.status(200).json({
            success: true,
            message: "Person fetched successfully",
            person,
            transactions
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch person"
        });
    }
}

// update person
export const updatePerson = async (req, res) => {
    try {
        const { personId } = req.params;
        const { name, phone, address } = req.body;

        let person = await Person.findOne({ _id: personId, userId: req.user._id });

        if (!person) {
            return res.status(404).json({ success: false, message: 'Person not found' });
        }

        if (req.file) {
            if (person.profileImage && person.profileImage.public_id) {
                await deleteFromCloudinary(person.profileImage.public_id);
            }
            const uploadResult = await uploadToCloudinary(req.file.buffer, 'khataApp/persons');

            person.profileImage = {
                url: uploadResult.secure_url,
                public_id: uploadResult.public_id,
            };
        }

        // Text fields update karein
        if (name) person.name = name.trim();
        if (phone !== undefined) person.phone = phone.trim();
        if (address !== undefined) person.address = address.trim();

        await person.save();

        return res.status(200).json({
            success: true,
            message: 'Person updated successfully',
            person,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// delete person controller
export const deletePerson = async (req, res) => {
    try {
        const { personId } = req.params;

        const person = await Person.findOneAndDelete({
            _id: personId,
            userId: req.user._id,
        });

        if (!person) {
            return res.status(404).json({ success: false, message: 'Person not found' });
        }
        await Transaction.deleteMany({ personId: person._id, userId: req.user._id });

        // Safe Cloudinary deletion
        if (person.profileImage?.public_id) {
            try {
                await deleteFromCloudinary(person.profileImage.public_id);
            } catch (imgErr) {
                console.error('Cloudinary Image Delete Warning:', imgErr.message);
            }
        }
        await Person.findByIdAndDelete(person._id);

        return res.status(200).json({
            success: true,
            message: 'Person and linked transactions deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};