const ChatMessage = require('../models/chatMessage');
const Match = require('../models/match');
const User = require('../models/User'); // Ensure imported
const Organisation = require('../models/Organaization'); // Ensure imported

exports.getChatMessages = async (req, res) => {
    try {
        const { matchId } = req.params;
        const messages = await ChatMessage.find({ match: matchId })
            .populate('sender', 'firstName lastName organisationName profileImage organisationLogo role') 
            .sort({ createdAt: 'asc' });

        const formattedMessages = messages.map(msg => {
            const senderObj = msg.sender || {};
            return {
                ...msg.toObject(),
                sender: {
                    _id: senderObj._id,
                    firstName: senderObj.organisationName || senderObj.firstName, 
                    profileImage: senderObj.organisationLogo || senderObj.profileImage,
                    role: msg.senderModel 
                }
            };
        });

        res.status(200).json({ success: true, data: formattedMessages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error fetching messages.' });
    }
};

exports.postChatMessage = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { senderId, message, senderModel } = req.body; 

        if (!senderId || !message) {
            return res.status(400).json({ success: false, message: 'Sender and message are required.' });
        }
        let modelType = senderModel || 'User';


        const newMessage = new ChatMessage({
            match: matchId,
            sender: senderId,
            senderModel: modelType, 
            message: message,
        });

        await newMessage.save();

        const populatedMessage = await ChatMessage.findById(newMessage._id).populate('sender');
                const senderObj = populatedMessage.sender;
        const responseData = {
            ...populatedMessage.toObject(),
            sender: {
                _id: senderObj._id,
                firstName: senderObj.organisationName || senderObj.firstName,
                profileImage: senderObj.organisationLogo || senderObj.profileImage,
                role: modelType
            }
        };
            
        res.status(201).json({ success: true, data: responseData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error posting message.' });
    }
};