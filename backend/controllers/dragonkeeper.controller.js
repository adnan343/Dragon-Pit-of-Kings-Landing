import Dragon from '../models/dragon.model.js';
import User from '../models/user.model.js';


// Update dragon health
export const updateDragonHealth = async (req, res) => {
    try {
        const { dragonId } = req.params;
        const { currentHealth, healthStatus } = req.body;
        
        if (!dragonId) {
            return res.status(400).json({ message: 'Dragon ID is required' });
        }
        
        // Find the dragon by ID
        const dragon = await Dragon.findById(dragonId);
        
        if (!dragon) {
            return res.status(404).json({ message: 'Dragon not found' });
        }
        
        // Update health information
        if (currentHealth !== undefined) {
            dragon.health.currentHealth = currentHealth;
        }
        
        if (healthStatus) {
            dragon.health.healthStatus = healthStatus;
        }
        
        // Update the last health update timestamp
        dragon.health.lastHealthUpdate = Date.now();
        
        // Save the updated dragon
        await dragon.save();
        
        return res.status(200).json({
            success: true,
            message: 'Dragon health updated successfully',
            data: dragon
        });
    } catch (error) {
        console.error('Error updating dragon health:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to update dragon health',
            error: error.message 
        });
    }
};

// Calculate health based on dragon attributes (size, age)
export const calculateDefaultHealth = (size, age) => {
    // Base health depends on size
    let baseHealth = 100;
    
    switch(size.toLowerCase()) {
        case 'small':
            baseHealth = 80;
            break;
        case 'medium':
            baseHealth = 100;
            break;
        case 'large':
            baseHealth = 150;
            break;
        case 'huge':
            baseHealth = 200;
            break;
        default:
            baseHealth = 100;
    }
    
    // Age modifier: younger and older dragons have less health
    let ageModifier = 1.0;
    if (age < 5) {
        // Young dragons have less health
        ageModifier = 0.7 + (age * 0.06);
    } else if (age > 50) {
        // Old dragons gradually lose health capacity
        ageModifier = 1.0 - ((age - 50) * 0.01);
        // Ensure it doesn't go below 0.5
        ageModifier = Math.max(ageModifier, 0.5);
    }
    
    return Math.round(baseHealth * ageModifier);
};

// Heal dragon health
export const healDragon = async (req, res) => {
    try {
        const { dragonId } = req.params;
        const { healAmount } = req.body;
        
        if (!dragonId) {
            return res.status(400).json({ message: 'Dragon ID is required' });
        }
        
        // Find the dragon by ID
        const dragon = await Dragon.findById(dragonId);
        
        if (!dragon) {
            return res.status(404).json({ message: 'Dragon not found' });
        }
        
        // Default heal amount if not provided
        const amountToHeal = healAmount || 10;
        
        // Calculate new health, ensuring it doesn't exceed max health
        const newHealth = Math.min(
            dragon.health.currentHealth + amountToHeal,
            dragon.health.maxHealth
        );
        
        // Update health
        dragon.health.currentHealth = newHealth;
        
        // Update health status based on the percentage of current health to max health
        const healthPercentage = (newHealth / dragon.health.maxHealth) * 100;
        
        if (healthPercentage >= 90) {
            dragon.health.healthStatus = 'Excellent';
        } else if (healthPercentage >= 70) {
            dragon.health.healthStatus = 'Good';
        } else if (healthPercentage >= 50) {
            dragon.health.healthStatus = 'Fair';
        } else if (healthPercentage >= 25) {
            dragon.health.healthStatus = 'Poor';
        } else {
            dragon.health.healthStatus = 'Critical';
        }
        
        // Update the last health update timestamp
        dragon.health.lastHealthUpdate = Date.now();
        
        // Save the updated dragon
        await dragon.save();
        
        return res.status(200).json({
            success: true,
            message: 'Dragon healed successfully',
            data: dragon
        });
    } catch (error) {
        console.error('Error healing dragon:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to heal dragon',
            error: error.message 
        });
    }
};


// Feed a dragon
export const feedDragon = async (req, res) => {
    try {
        const { dragonId } = req.params;
        const { foodType, feederId } = req.body;

        if (!dragonId) {
            return res.status(400).json({ message: 'Dragon ID is required' });
        }

        // Find the dragon by ID
        const dragon = await Dragon.findById(dragonId);

        if (!dragon) {
            return res.status(404).json({ message: 'Dragon not found' });
        }

        // Check if the feeder is a Dragonkeeper
        if (feederId) {
            const feeder = await User.findById(feederId);
            if (!feeder || feeder.userType !== 'Dragonkeeper') {
                return res.status(403).json({
                    success: false,
                    message: 'Only Dragonkeepers can feed dragons'
                });
            }
        }

        // Update feeding information
        dragon.feeding.lastFed = Date.now();
        dragon.feeding.feedingCount += 1;

        // Health boost from feeding
        let healthBoost = 5; // Default health boost

        // Check if food type matches preferred food
        if (foodType && foodType === dragon.feeding.preferredFood) {
            healthBoost = 10; // Double health boost for preferred food
        }

        // Apply health boost (not exceeding max health)
        const newHealth = Math.min(
            dragon.health.currentHealth + healthBoost,
            dragon.health.maxHealth
        );

        dragon.health.currentHealth = newHealth;

        // Update health status based on the percentage of current health to max health
        const healthPercentage = (newHealth / dragon.health.maxHealth) * 100;

        if (healthPercentage >= 90) {
            dragon.health.healthStatus = 'Excellent';
        } else if (healthPercentage >= 70) {
            dragon.health.healthStatus = 'Good';
        } else if (healthPercentage >= 50) {
            dragon.health.healthStatus = 'Fair';
        } else if (healthPercentage >= 25) {
            dragon.health.healthStatus = 'Poor';
        } else {
            dragon.health.healthStatus = 'Critical';
        }

        // Update the hunger level immediately to 'Satiated'
        dragon.feeding.hungerLevel = 'Satiated';

        // Save the updated dragon
        await dragon.save();

        return res.status(200).json({
            success: true,
            message: 'Dragon fed successfully',
            data: {
                dragon,
                healthBoost,
                isPreferredFood: foodType === dragon.feeding.preferredFood
            }
        });
    } catch (error) {
        console.error('Error feeding dragon:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to feed dragon',
            error: error.message
        });
    }
};

// Check dragon hunger status
export const checkDragonHunger = async (req, res) => {
    try {
        const { dragonId } = req.params;

        if (!dragonId) {
            return res.status(400).json({ message: 'Dragon ID is required' });
        }

        // Find the dragon by ID
        const dragon = await Dragon.findById(dragonId);

        if (!dragon) {
            return res.status(404).json({ message: 'Dragon not found' });
        }

        // Calculate hours since last feeding
        const now = new Date();
        const hoursSinceLastFed = (now - dragon.feeding.lastFed) / (1000 * 60 * 60);

        return res.status(200).json({
            success: true,
            data: {
                dragon: {
                    _id: dragon._id,
                    name: dragon.name,
                    feeding: dragon.feeding
                },
                hoursSinceLastFed: Math.round(hoursSinceLastFed * 10) / 10, // Round to 1 decimal place
                currentHungerStatus: dragon.feeding.hungerLevel
            }
        });
    } catch (error) {
        console.error('Error checking dragon hunger:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to check dragon hunger',
            error: error.message
        });
    }
};

// Update dragon's preferred food
export const updatePreferredFood = async (req, res) => {
    try {
        const { dragonId } = req.params;
        const { preferredFood } = req.body;

        if (!dragonId) {
            return res.status(400).json({ message: 'Dragon ID is required' });
        }

        if (!preferredFood) {
            return res.status(400).json({ message: 'Preferred food is required' });
        }

        // Find the dragon by ID
        const dragon = await Dragon.findById(dragonId);

        if (!dragon) {
            return res.status(404).json({ message: 'Dragon not found' });
        }

        // Update preferred food
        dragon.feeding.preferredFood = preferredFood;

        // Save the updated dragon
        await dragon.save();

        return res.status(200).json({
            success: true,
            message: 'Dragon preferred food updated successfully',
            data: dragon
        });
    } catch (error) {
        console.error('Error updating preferred food:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update preferred food',
            error: error.message
        });
    }
};
