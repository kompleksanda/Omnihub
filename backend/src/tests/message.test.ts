import request from 'supertest';
import { app } from '../server';
import prisma from '../prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

describe('Message Endpoints', () => {
    let token: string;
    let userId: string;
    let conversationId: string;

    beforeAll(async () => {
        await prisma.message.deleteMany();
        await prisma.conversation.deleteMany();
        await prisma.user.deleteMany();

        // Create user
        const user = await prisma.user.create({
            data: {
                email: 'msg@test.com',
                password: 'hashedpassword',
                name: 'Msg Tester',
            },
        });
        userId = user.id;
        token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);

        // Create conversation
        const conversation = await prisma.conversation.create({
            data: {
                platform: 'mock',
                externalId: 'mock_conv_1',
                assigneeId: userId,
                lastMessageAt: new Date(),
            },
        });
        conversationId = conversation.id;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should send a message', async () => {
        const res = await request(app)
            .post('/api/messages')
            .set('Authorization', `Bearer ${token}`)
            .send({
                conversationId,
                content: 'Hello World',
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.content).toEqual('Hello World');
        expect(res.body.senderId).toEqual(userId);
    });

    it('should fetch messages for conversation', async () => {
        const res = await request(app)
            .get(`/api/messages/${conversationId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].content).toEqual('Hello World');
    });

    it('should fetch conversations', async () => {
        const res = await request(app)
            .get('/api/messages/conversations')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].id).toEqual(conversationId);
        expect(res.body[0].lastMessage).toEqual('Hello World');
    });
});
