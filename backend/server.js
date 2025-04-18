import express from 'express';
import {connectDB} from "./config/db.js";
import dragonRoutes from "./routes/dragon.route.js";

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.use("/api/dragons", dragonRoutes)

app.listen(3000, () => {
    connectDB();
    console.log('Server started at http://localhost:3000');
});

