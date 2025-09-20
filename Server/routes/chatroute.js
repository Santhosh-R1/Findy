const express = require('express');
const router = express.Router();
const { getChatMessages, postChatMessage } = require('../controllers/chatController');

router.route('/:matchId').get(getChatMessages).post(postChatMessage);



module.exports = router;