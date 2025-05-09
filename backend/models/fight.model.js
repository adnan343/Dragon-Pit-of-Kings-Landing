import mongoose from 'mongoose';

const FightSchema = new mongoose.Schema({
    challenger: {
        dragon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dragon',
            required: true
        },
        rider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    opponent: {
        dragon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dragon',
            required: true
        },
        rider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    result: {
        winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dragon'
        },
        loser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dragon'
        },
        isDraw: {
            type: Boolean,
            default: false
        },
        winnerScore: {
            type: Number,
            default: 0
        },
        loserScore: {
            type: Number,
            default: 0
        }
    },
    fightDate: {
        type: Date,
        default: Date.now
    },
    fightDetails: {
        location: String,
        notes: String,
        rounds: {
            type: Number,
            default: 1
        }
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const Fight = mongoose.model('Fight', FightSchema);

export default Fight;