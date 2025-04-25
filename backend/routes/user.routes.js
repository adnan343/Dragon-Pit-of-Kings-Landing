import express from 'express';

import {createUser, getUsers, loginUser, deleteUser} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", createUser)
router.get("/", getUsers)
router.post("/login", loginUser);
router.delete("/:id", deleteUser);



export default router;