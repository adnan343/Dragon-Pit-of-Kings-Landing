import User from '../models/user.model.js';
import mongoose from 'mongoose';

export const createUser = async (req, res) => {
    const user = req.body;
    if (!user.username || !user.password || !user.name || !user.userType) {
        return res.status(400).json({ success: false, msg: "Please provide all the required fields" });
    }

    try {
        const usernameExists = await checkUsernameExists(user.username);
        if (usernameExists) {
            return res.status(400).json({ success: false, msg: "Username already exists" });
        }

        const newUser = new User(user);
        await newUser.save(); // Save the user to the database
        res.status(201).json({ success: true, msg: "User created successfully" });
    } catch (err) {
        console.error('Error in creating user:', err);
        res.status(500).json({ success: false, msg: "SERVER ERROR" });
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
        const users = await User.find({})
        res.status(200).json({success: true, data: users});
    } catch (error) {
        console.error("Error in fetching users: ", error.message);
        res.status(500).json({success: false, msg: "SERVER ERROR"});
    }
}