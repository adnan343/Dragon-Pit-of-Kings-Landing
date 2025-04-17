import express from 'express';
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

// console.log(process.env.MONGO_URI);

app.listen(3000, () => {
    connectDB();
    console.log('Server started at http://localhost:3000');
});

