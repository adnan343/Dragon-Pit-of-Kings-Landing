import express from "express";

import {
  createUser,
  getUsers,
  loginUser,
  deleteUser,
  updateUser,
  getUserById,
  getUserIdByUsername,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getUsers);
router.put("/:id", updateUser);
router.post("/login", loginUser);
router.delete("/:id", deleteUser);
router.get("/:id", getUserById);
router.get("/name/:username", getUserIdByUsername);

export default router;
