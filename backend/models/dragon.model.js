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
    }
}, {
    timestamps: true // Add createdAt and updatedAt fields
});

const Dragon = mongoose.model('Dragon', DragonSchema);

export default Dragon;