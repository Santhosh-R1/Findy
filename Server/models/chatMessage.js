const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
        index: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel' 
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['User', 'Organisation', 'Moderator'], 
        default: 'User'
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);