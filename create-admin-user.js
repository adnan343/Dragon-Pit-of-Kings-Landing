import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './backend/models/user.model.js';

dotenv.config();

// Admin user details
const adminUser = {
    username: 'admin',
    password: 'dragonadmin123',
    name: 'Dragon Master',
    userType: 'admin'
};

// Connect to MongoDB
const createAdminUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: adminUser.username });

        if (existingAdmin) {
            console.log('Admin user already exists');
            mongoose.disconnect();
            return;
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminUser.password, salt);

        // Create new admin user
        const newAdmin = new User({
            ...adminUser,
            password: hashedPassword
        });

        await newAdmin.save();
        console.log('Admin user created successfully');

        mongoose.disconnect();
    } catch (error) {
        console.error('Error creating admin user:', error.message);
        process.exit(1);
    }
};

createAdminUser();