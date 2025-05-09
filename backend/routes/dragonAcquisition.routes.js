import express from "express";
import { acquireDragon } from "../controllers/dragonAcquisition.controller.js";

const router = express.Router();

// Route for acquiring a dragon
router.post("/dragons/acquire", acquireDragon);

export default router;
