const express = require('express');
const router = express.Router();
const {
    getOrCreateDM,
    createGroupChat,
    getChatRooms,
    getMessages,
    sendMessage,
    markAsRead,
    addParticipants,
    leaveGroup
} = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authMiddleware);

// Chat room routes
router.post('/dm', getOrCreateDM);
router.post('/group', createGroupChat);
router.get('/rooms', getChatRooms);

// Message routes
router.get('/rooms/:roomId/messages', getMessages);
router.post('/rooms/:roomId/messages', upload.array('file', 5), sendMessage);
router.post('/rooms/:roomId/read', markAsRead);

// Group management
router.post('/rooms/:roomId/participants', addParticipants);
router.post('/rooms/:roomId/leave', leaveGroup);

module.exports = router;
