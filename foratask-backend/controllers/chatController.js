const ChatRoom = require('../models/chatRoom');
const ChatMessage = require('../models/chatMessage');
const User = require('../models/user');
const path = require('path');

// Get or create DM chat room
const getOrCreateDM = async (req, res) => {
    try {
        const { otherUserId } = req.body;
        const userId = req.user.id;
        const companyId = req.user.company;

        // Verify other user is in same company
        const otherUser = await User.findOne({ _id: otherUserId, company: companyId });
        if (!otherUser) {
            return res.status(404).json({ message: 'User not found in your organization' });
        }

        const room = await ChatRoom.findOrCreateDM(companyId, userId, otherUserId);
        await room.populate('participants', 'firstName lastName avatar email');

        res.status(200).json({ success: true, room });
    } catch (error) {
        console.error('Get/Create DM error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Create group chat
const createGroupChat = async (req, res) => {
    try {
        const { name, description, participantIds } = req.body;
        const userId = req.user.id;
        const companyId = req.user.company;

        if (!name || !participantIds || participantIds.length < 2) {
            return res.status(400).json({ message: 'Group name and at least 2 participants required' });
        }

        // Verify all participants are in same company
        const participants = await User.find({ 
            _id: { $in: participantIds }, 
            company: companyId 
        });

        if (participants.length !== participantIds.length) {
            return res.status(400).json({ message: 'Some users not found in your organization' });
        }

        // Include creator in participants
        const allParticipants = [...new Set([userId, ...participantIds])];

        const room = await ChatRoom.create({
            company: companyId,
            type: 'group',
            name,
            description,
            participants: allParticipants,
            admins: [userId],
            createdBy: userId
        });

        await room.populate('participants', 'firstName lastName avatar email');

        // Emit socket event for group creation
        if (global.io) {
            allParticipants.forEach(participantId => {
                const socketId = global.connectedUsers[participantId.toString()];
                if (socketId) {
                    global.io.to(socketId).emit('newChatRoom', room);
                }
            });
        }

        res.status(201).json({ success: true, room });
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get user's chat rooms
const getChatRooms = async (req, res) => {
    try {
        const userId = req.user.id;
        const companyId = req.user.company;

        const rooms = await ChatRoom.find({
            company: companyId,
            participants: userId,
            isActive: true
        })
        .populate('participants', 'firstName lastName avatar email')
        .populate('lastMessage')
        .sort({ lastMessageAt: -1 });

        res.status(200).json({ success: true, rooms });
    } catch (error) {
        console.error('Get chat rooms error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get messages for a chat room
const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;
        const companyId = req.user.company;
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 50;

        // Verify user is participant
        const room = await ChatRoom.findOne({
            _id: roomId,
            company: companyId,
            participants: userId
        });

        if (!room) {
            return res.status(404).json({ message: 'Chat room not found or access denied' });
        }

        const messages = await ChatMessage.find({
            room: roomId,
            isDeleted: false
        })
        .populate('sender', 'firstName lastName avatar email')
        .populate('mentions', 'firstName lastName')
        .populate('replyTo')
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(limit);

        const total = await ChatMessage.countDocuments({ room: roomId, isDeleted: false });

        res.status(200).json({
            success: true,
            messages: messages.reverse(),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Send message
const sendMessage = async (req, res) => {
    try {
        const roomId = req.params.roomId || req.body.roomId;
        const { content, messageType = 'text', mentions = [], replyTo = null } = req.body;
        const userId = req.user.id;
        const companyId = req.user.company;

        // Verify user is participant
        const room = await ChatRoom.findOne({
            _id: roomId,
            company: companyId,
            participants: userId
        });

        if (!room) {
            return res.status(404).json({ message: 'Chat room not found or access denied' });
        }

        // Handle file attachments
        const attachments = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                attachments.push({
                    filename: file.filename,
                    originalName: file.originalname,
                    path: file.path.replace(/\\/g, '/'),
                    size: file.size,
                    mimeType: file.mimetype,
                    fileExtension: path.extname(file.originalname)
                });
            });
        }

        const message = await ChatMessage.create({
            room: roomId,
            sender: userId,
            company: companyId,
            content,
            messageType: attachments.length > 0 ? 'file' : messageType,
            attachments,
            mentions,
            replyTo,
            readBy: [{ user: userId, readAt: new Date() }]
        });

        // Update room's last message
        room.lastMessage = message._id;
        room.lastMessageAt = new Date();
        await room.save();

        await message.populate('sender', 'firstName lastName avatar email');
        await message.populate('mentions', 'firstName lastName');

        // Emit socket event to room participants
        if (global.io) {
            room.participants.forEach(participantId => {
                if (participantId.toString() !== userId) {
                    const socketId = global.connectedUsers[participantId.toString()];
                    if (socketId) {
                        global.io.to(socketId).emit('newMessage', {
                            roomId,
                            message
                        });
                    }
                }
            });
        }

        res.status(201).json({ success: true, message });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Mark messages as read
const markAsRead = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        await ChatMessage.updateMany(
            {
                room: roomId,
                'readBy.user': { $ne: userId }
            },
            {
                $push: { readBy: { user: userId, readAt: new Date() } }
            }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add participants to group
const addParticipants = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { userIds } = req.body;
        const userId = req.user.id;
        const companyId = req.user.company;

        const room = await ChatRoom.findOne({
            _id: roomId,
            company: companyId,
            type: 'group',
            admins: userId
        });

        if (!room) {
            return res.status(404).json({ message: 'Group not found or you are not an admin' });
        }

        // Verify users are in same company
        const users = await User.find({ _id: { $in: userIds }, company: companyId });
        if (users.length !== userIds.length) {
            return res.status(400).json({ message: 'Some users not found' });
        }

        room.participants = [...new Set([...room.participants.map(p => p.toString()), ...userIds])];
        await room.save();

        // Create system message
        const addedNames = users.map(u => `${u.firstName} ${u.lastName}`).join(', ');
        await ChatMessage.create({
            room: roomId,
            sender: userId,
            company: companyId,
            content: `Added ${addedNames} to the group`,
            messageType: 'system'
        });

        await room.populate('participants', 'firstName lastName avatar email');
        res.status(200).json({ success: true, room });
    } catch (error) {
        console.error('Add participants error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Leave group
const leaveGroup = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;
        const companyId = req.user.company;

        const room = await ChatRoom.findOne({
            _id: roomId,
            company: companyId,
            type: 'group',
            participants: userId
        });

        if (!room) {
            return res.status(404).json({ message: 'Group not found' });
        }

        room.participants = room.participants.filter(p => p.toString() !== userId);
        room.admins = room.admins.filter(a => a.toString() !== userId);
        
        if (room.participants.length === 0) {
            room.isActive = false;
        }
        
        await room.save();

        // Create system message
        const user = await User.findById(userId);
        await ChatMessage.create({
            room: roomId,
            sender: userId,
            company: companyId,
            content: `${user.firstName} ${user.lastName} left the group`,
            messageType: 'system'
        });

        res.status(200).json({ success: true, message: 'Left group successfully' });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getOrCreateDM,
    createGroupChat,
    getChatRooms,
    getMessages,
    sendMessage,
    markAsRead,
    addParticipants,
    leaveGroup
};
