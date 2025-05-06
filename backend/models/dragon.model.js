import mongoose from 'mongoose';

const DragonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
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
    rider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        default: null // Null if no rider has acquired the dragon yet
    }
}, {
    timestamps: true // Add createdAt and updatedAt fields
});

const Dragon = mongoose.model('Dragon', DragonSchema);

export default Dragon;