// models/chatMessage.js
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
        ref: 'User', // Sender can be a user, moderator, or finder
        required: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);