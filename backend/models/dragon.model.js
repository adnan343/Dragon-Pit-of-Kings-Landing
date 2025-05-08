// Create dragon.model.js if it doesn't exist
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
    rider: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

const Dragon = mongoose.model('Dragon', dragonSchema);

export default Dragon;