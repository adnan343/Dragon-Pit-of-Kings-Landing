import express from 'express';
import mongoose from 'mongoose';
import {connectDB} from "./config/db.js";
import Dragon from "./models/dragon.model.js";

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.post("/api/dragons", async (req, res) => {
    const dragon = req.body; // get the data from the request body

    if(!dragon.name || !dragon.size || !dragon.age || !dragon.description) {
        return res.status(400).json({success: false, msg: "Please provide all the required fields"});
    }

    const newDragon = new Dragon(dragon);
    try {
        await newDragon.save();
        res.status(201).json({success: true, msg: "Dragon created successfully"});
    } catch (error) {
        console.error("Error in creating dragon: ", error.message);
        res.status(500).json({success: false, msg: "SERVER ERROR"});
    }
})

app.delete("/api/dragons/:id", async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    // console.log(mongoose.Types.ObjectId.isValid(id));


    try {
        // Call findByIdAndDelete to delete the dragon by ID
        const deletedDragon = await Dragon.findByIdAndDelete(id);

        // If no dragon was found, return 404
        if (!deletedDragon) {
            return res.status(404).json({ message: "Dragon not found" });
        }

        // Success: Dragon deleted
        return res.status(200).json({
            message: "Dragon deleted successfully",
            // data: deletedDragon,
        });

    } catch (error) {
        console.error("Error in deleting dragon: ", error.message);
        res.status(404).json({success: false, msg: "Product not found"});
    }
})

app.get("/api/dragons", async (req, res) => {
    try {
        const dragons = await Dragon.find({});
        res.status(200).json({success: true, data: dragons});
    } catch (error) {
        console.error("Error in fetching dragons: ", error.message);
        res.status(500).json({success: false, msg: "SERVER ERROR"});
    }
})

// console.log(process.env.MONGO_URI);

app.listen(3000, () => {
    connectDB();
    console.log('Server started at http://localhost:3000');
});

