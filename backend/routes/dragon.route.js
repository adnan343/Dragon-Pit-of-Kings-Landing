import express from 'express';
import Dragon from "../models/dragon.model.js";
import mongoose from "mongoose";

const router = express.Router();

router.post("/", async (req, res) => {
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

router.put("/:id", async (req, res) => {
    const {id} = req.params
    const dragon = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }


    try {
        const updatedDragon = await Dragon.findByIdAndUpdate(id, dragon, {new:true});

        if (!updatedDragon) {
            return res.status(404).json({ message: "Dragon not found" });
        }

        res.status(200).json({success: true, msg: "Dragon updated successfully"});
    } catch (error) {
        console.error("Error in updating dragon: ", error.message);
        res.status(500).json({success: false, msg: "SERVER ERROR"});
    }
})

router.delete("/:id", async (req, res) => {
    const {id} = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

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

router.get("/", async (req, res) => {
    try {
        const dragons = await Dragon.find({});
        res.status(200).json({success: true, data: dragons});
    } catch (error) {
        console.error("Error in fetching dragons: ", error.message);
        res.status(500).json({success: false, msg: "SERVER ERROR"});
    }
})

export default router;