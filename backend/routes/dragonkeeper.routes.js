import express from 'express';
import {
    updateDragonHealth,
    healDragon,
    feedDragon,
    checkDragonHunger,
    updatePreferredFood
} from '../controllers/dragonkeeper.controller.js';

const router = express.Router();

// Health management routes
router.patch('/dragons/:dragonId/health', updateDragonHealth);
router.post('/dragons/:dragonId/heal', healDragon);

// Feeding management routes
router.post('/dragons/:dragonId/feed', feedDragon);
router.get('/dragons/:dragonId/hunger', checkDragonHunger);
router.patch('/dragons/:dragonId/preferred-food', updatePreferredFood);

export default router;
