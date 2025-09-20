const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
    lostItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
        index: true,
    },
    foundItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
        index: true,
    },
    lostItemOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    finder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    moderator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Moderator', 
    },
    isFinderAllowedInChat: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['pending_review', 'confirmed_by_owner', 'rejected_by_owner', 'resolved'],
        default: 'pending_review',
    },
    matchType: {
        type: String,
        enum: ['ai', 'manual'],
        required: true,
    },
    matchScore: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

matchSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });

module.exports = mongoose.model("Match", matchSchema);