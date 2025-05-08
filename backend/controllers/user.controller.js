import User from '../models/user.model.js'; // User model
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing and verification

export const createUser = async (req, res) => {
    const user = req.body;

    // Ensure all required fields exist
    if (!user.username || !user.password || !user.name || !user.userType) {
        return res.status(400).json({ success: false, msg: "Please provide all the required fields" });
    }

    try {
        // Check if username already exists
        const usernameExists = await checkUsernameExists(user.username);
        if (usernameExists) {
            return res.status(400).json({ success: false, msg: "Username already exists" });
        }

        // Hash the password before saving the user
        const salt = await bcrypt.genSalt(10); // Generate salt
        const hashedPassword = await bcrypt.hash(user.password, salt); // Hash password
        user.password = hashedPassword;

        const newUser = new User(user); // Create a new user with hashed password
        await newUser.save(); // Save the user to the database
        res.status(201).json({ success: true, msg: "User created successfully" });
    } catch (err) {
        console.error('Error in creating user:', err);
        res.status(500).json({ success: false, msg: "SERVER ERROR" });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params; // Get user ID from request parameters
    const updates = req.body; // Get update fields from request body

    if (!id) {
        return res.status(400).json({ success: false, msg: "Please provide a user ID." });
    }

    try {
        // If a password update is included, hash it before saving
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        // Update the user by ID with the provided fields
        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        // If user is not found, return error
        if (!updatedUser) {
            return res.status(404).json({ success: false, msg: "User not found." });
        }

        res.status(200).json({
            success: true,
            msg: "User updated successfully.",
            data: updatedUser
        });
    } catch (error) {
        console.error("Error updating user: ", error.message);
        res.status(500).json({ success: false, msg: "Internal Server Error." });
    }
};


export const deleteUser = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, msg: "Please provide a user ID." });
    }

    try {
        // Find user by ID and delete
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ success: false, msg: "User not found." });
        }

        res.status(200).json({
            success: true,
            msg: "User deleted successfully.",
            data: { username: deletedUser.username, name: deletedUser.name }
        });
    } catch (error) {
        console.error("Error deleting user: ", error.message);
        res.status(500).json({ success: false, msg: "Internal Server Error." });
    }
};


export const loginUser = async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);

    // Validate required fields
    if (!username || !password) {
        return res.status(400).json({ success: false, msg: "Please provide both username and password" });
    }

    try {
        // Check if user exists in the database
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found" });
        }

        // Compare input password with hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, msg: "Invalid password" });
        }

        // If login is successful, respond back with user data (you can also generate a token here)
        res.status(200).json({ 
            success: true, 
            msg: "User logged in successfully", 
            data: { username: user.username, name: user.name, userType: user.userType } 
        });

    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};

const checkUsernameExists = async (username) => {
    try {
        // Use findOne to get a single document that matches the username
        const user = await User.findOne({ username: username });
        if (user) {
            console.log('Username already exists');
            return true; // Username exists
        }
        console.log('Username is available');
        return false; // Username does not exist
    } catch (err) {
        console.error('Error checking username:', err);
        throw err; // Propagate error
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error("Error in fetching users: ", error.message);
        res.status(500).json({ success: false, msg: "SERVER ERROR" });
    }
};