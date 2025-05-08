import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import dragonRoutes from './routes/dragon.route.js';
import dragonAcquisitionRoutes from './routes/dragonAcquisition.routes.js';
// Import other routes as needed...

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});


// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Routes
app.use('/api', dragonRoutes);
app.use('/api', dragonAcquisitionRoutes);
// Add other routes as needed...

// Base route for testing API
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const addTestDragons = async () => {
    try {
        const count = await Dragon.countDocuments();
        if (count === 0) {
            console.log('Adding test dragons...');
            await Dragon.create([
                {
                    name: 'Drogon',
                    size: 'Large',
                    age: 8,
                    description: 'Black dragon with red accents, fierce and loyal'
                },
                {
                    name: 'Rhaegal',
                    size: 'Medium',
                    age: 7,
                    description: 'Green scales, more docile than his siblings'
                },
                {
                    name: 'Viserion',
                    size: 'Medium',
                    age: 7,
                    description: 'Cream and gold colored dragon, curious and intelligent'
                }
            ]);
            console.log('Test dragons added');
        } else {
            console.log(`${count} dragons already in database`);
        }
    } catch (error) {
        console.error('Error adding test dragons:', error);
    }
};


// Start server
const PORT = process.env.PORT || 5000;

// Connect to database then start server
connectDB().then(async () => {
    await addTestDragons();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    process.exit(1);
});
