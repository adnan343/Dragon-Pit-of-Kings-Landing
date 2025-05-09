import express from 'express';
import {connectDB} from "./config/db.js";
import dragonRoutes from "./routes/dragon.route.js";
import userRoutes from "./routes/user.routes.js";
import dragonAcquisitionRoutes from './routes/dragonAcquisition.routes.js'; // New import


const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.use("/api/dragons", dragonRoutes)

app.use("/api/users", userRoutes)

app.use("/api/dragon-acquisition", dragonAcquisitionRoutes); // New route

app.listen(PORT, () => {
    connectDB();
    console.log('Server started at http://localhost:3000');
});

//foul project