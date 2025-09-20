// controllers/chatController.js
const ChatMessage = require('../models/chatMessage');
const Match = require('../models/match');

// @desc    Get all messages for a specific match
// @route   GET /api/chat/:matchId
exports.getChatMessages = async (req, res) => {
    try {
        const { matchId } = req.params;
        const messages = await ChatMessage.find({ match: matchId })
            .populate('sender', 'firstName profileImage role') // Get sender's name, image, and role
            .sort({ createdAt: 'asc' }); // Show oldest messages first

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching messages.' });
    }
};

// @desc    Post a new message to a chat
// @route   POST /api/chat/:matchId
exports.postChatMessage = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { senderId, message } = req.body;

        if (!senderId || !message) {
            return res.status(400).json({ success: false, message: 'Sender and message are required.' });
        }

        const newMessage = new ChatMessage({
            match: matchId,
            sender: senderId,
            message: message,
        });

        await newMessage.save();

        // Populate sender details before sending back to the client
        const populatedMessage = await ChatMessage.findById(newMessage._id)
            .populate('sender', 'firstName profileImage role');
            
        res.status(201).json({ success: true, data: populatedMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error posting message.' });
    }
};