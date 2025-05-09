import express from "express";

import {
  createDragon,
  deleteDragon,
  getDragons,
  updateDragon,
} from "../controllers/dragon.controller.js";

const router = express.Router();
console.log("Registering dragon routes");

router.post("/", createDragon);

router.put("/:id", updateDragon);

router.delete("/:id", deleteDragon);

// Add a specific API test endpoint
router.get("/test", (req, res) => {
  res.json({ message: "Dragon API is working" });
});

router.get("/all", getDragons);

export default router;
