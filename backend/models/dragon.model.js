import mongoose from 'mongoose';

const dragonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/300x200?text=Dragon'
    },
    health: {
        currentHealth: {
            type: Number,
            default: 100
        },
        maxHealth: {
            type: Number,
            default: 100
        },
        lastHealthUpdate: {
            type: Date,
            default: Date.now
        },
        healthStatus: {
            type: String,
            enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
            default: 'Excellent'
        }
    },
    feeding: {
        lastFed: {
            type: Date,
            default: Date.now
        },
        hungerLevel: {
            type: String,
            enum: ['Satiated', 'Content', 'Hungry', 'Starving', 'Ravenous'],
            default: 'Content'
        },
        feedingCount: {
            type: Number,
            default: 0
        },
        preferredFood: {
            type: String,
            default: 'Meat'
        }
    },
    fighting: {
        strength: {
            type: Number,
            default: 50
        },
        agility: {
            type: Number,
            default: 50
        },
        wins: {
            type: Number,
            default: 0
        },
        losses: {
            type: Number,
            default: 0
        },
        draws: {
            type: Number,
            default: 0
        },
        lastFight: {
            type: Date
        }
    },
    rider: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});


// Add pre-save hook to ensure hunger level is updated based on last feeding time
DragonSchema.pre('save', function(next) {
    // Calculate hours since last feeding
    if (this.feeding && this.feeding.lastFed) {
        const now = new Date();
        const hoursSinceLastFed = (now - this.feeding.lastFed) / (1000 * 60 * 60);

        // Update hunger level based on time since last feeding
        if (hoursSinceLastFed < 6) {
            this.feeding.hungerLevel = 'Satiated';
        } else if (hoursSinceLastFed < 12) {
            this.feeding.hungerLevel = 'Content';
        } else if (hoursSinceLastFed < 24) {
            this.feeding.hungerLevel = 'Hungry';
        } else if (hoursSinceLastFed < 48) {
            this.feeding.hungerLevel = 'Starving';
        } else {
            this.feeding.hungerLevel = 'Ravenous';
        }
    }
    next();
});

const Dragon = mongoose.model('Dragon', DragonSchema);


export default Dragon;