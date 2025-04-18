import express from 'express';

import {createDragon, deleteDragon, getDragons, updateDragon} from "../controllers/dragon.controller.js";

const router = express.Router();

router.post("/", createDragon)

router.put("/:id", updateDragon)

router.delete("/:id", deleteDragon)

router.get("/", getDragons)

export default router;