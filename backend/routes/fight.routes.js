import express from "express";
import * as fightController from "../controllers/fight.controller.js";

const router = express.Router();

// All routes are now accessible without auth middleware
router.post("/initiate", fightController.initiateFight);
router.post("/complete", fightController.completeFight);
router.patch("/cancel/:fightId", fightController.cancelFight);
router.get("/dragon/:dragonId", fightController.getDragonFights);
router.get("/stats/dragon/:dragonId", fightController.getDragonFightStats);
router.get("/", fightController.getAllFights);
router.get("/fight/:fightId", fightController.getFightParticipants);

export default router;
