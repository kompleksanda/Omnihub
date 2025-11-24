import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes';
import integrationRoutes from './routes/integration.routes';
import messageRoutes from './routes/message.routes';
import { integrationManager } from './integrations/integration.manager';
import { MockAdapter } from './integrations/mock/mock.adapter';

dotenv.config();

// Register Adapters
integrationManager.register(new MockAdapter());

export const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
    res.send('OmniHub Backend is running');
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinConversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`User joined conversation: ${conversationId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

if (require.main === module) {
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
