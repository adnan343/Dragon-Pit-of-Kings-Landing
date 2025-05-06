// backend/routes/dragonkeeper.routes.js
import express from 'express';
import { updateDragonHealth, healDragon } from '../controllers/dragonkeeper.controller.js';

const router = express.Router();

// Route for updating dragon health
router.patch('/dragons/:dragonId/health', updateDragonHealth);

// Route for healing a dragon
router.post('/dragons/:dragonId/heal', healDragon);

export default router;