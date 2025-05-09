import express from "express";
import { acquireDragon, removeDragon } from "../controllers/dragonAcquisition.controller.js";

const router = express.Router();

// Route for acquiring a dragon
router.post("/", acquireDragon);
router.post("/remove", removeDragon);

export default router;
