import Dragon from "../models/dragon.model.js";
import mongoose from "mongoose";

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

export const getDragons = async (req, res) => {
    try {
        const dragons = await Dragon.find({});
        res.status(200).json({success: true, data: dragons});
    } catch (error) {
        console.error("Error in fetching dragons: ", error.message);
        res.status(500).json({success: false, msg: "SERVER ERROR"});
    }
}

export const createDragon = async (req, res) => {
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
}

export const deleteDragon = async (req, res) => {
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
        res.status(500).json({success: false, msg: "SERVER ERROR"});
    }
}

export const updateDragon = async (req, res) => {
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
}