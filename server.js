const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Mock database
let pulses = [];
let nodes = [];
let nodeMembers = new Map();

// Socket.io for real-time features
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-node', (data) => {
        socket.join(data.room);
        socket.to(data.room).emit('chat-message', {
            username: 'AI Moderator',
            message: 'A new member has joined the conversation. Welcome!'
        });
    });

    socket.on('send-chat-message', (data) => {
        io.to(data.room).emit('chat-message', {
            username: data.username,
            message: data.message
        });

        // AI Moderator responses
        if (data.message.toLowerCase().includes('sad') || data.message.toLowerCase().includes('hopeless')) {
            setTimeout(() => {
                io.to(data.room).emit('chat-message', {
                    username: 'AI Moderator',
                    message: 'That sounds really difficult. Thank you for sharing. Has anyone else felt this way?'
                });
            }, 1500);
        }

        if (data.message.toLowerCase().includes('anxious') || data.message.toLowerCase().includes('stress')) {
            setTimeout(() => {
                io.to(data.room).emit('chat-message', {
                    username: 'AI Moderator',
                    message: 'Many people experience anxiety. Would anyone like to share what helps them cope?'
                });
            }, 1500);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// API Routes
app.post('/api/pulse', (req, res) => {
    const { username, word } = req.body;
    
    if (!username || !word) {
        return res.status(400).json({ error: 'Username and word are required' });
    }

    // Store pulse
    pulses.push({ username, word, timestamp: new Date() });

    // Check if we should create a node (simple logic: 2+ same words in last 5 minutes)
    const recentSamePulses = pulses.filter(p => 
        p.word.toLowerCase() === word.toLowerCase() && 
        new Date() - new Date(p.timestamp) < 5 * 60 * 1000
    );

    if (recentSamePulses.length >= 2) {
        const nodeName = `Coping with ${word}`;
        let node = nodes.find(n => n.name === nodeName && n.isActive);

        if (!node) {
            node = { id: nodes.length + 1, name: nodeName, isActive: true };
            nodes.push(node);
        }

        res.json({
            message: "Pulse recorded",
            nodeInvite: { id: node.id, name: node.name }
        });
    } else {
        res.json({ message: "Pulse recorded" });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📧 API available at http://localhost:${PORT}/api`);
});