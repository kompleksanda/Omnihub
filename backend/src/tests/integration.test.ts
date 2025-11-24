import request from 'supertest';
import { app } from '../server';
import prisma from '../prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

describe('Integration Endpoints', () => {
    let token: string;
    let userId: string;

    beforeAll(async () => {
        await prisma.socialAccount.deleteMany();
        await prisma.user.deleteMany();

        // Create a user for testing
        const user = await prisma.user.create({
            data: {
                email: 'integration@test.com',
                password: 'hashedpassword',
                name: 'Integration Tester',
            },
        });
        userId = user.id;
        token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should redirect to auth url', async () => {
        const res = await request(app).get('/api/integrations/mock/auth');
        expect(res.statusCode).toEqual(302);
        expect(res.header.location).toContain('http://localhost:3000/mock-auth');
    });

    it('should handle callback and create social account', async () => {
        const res = await request(app)
            .get('/api/integrations/mock/callback?code=success')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Integration successful');
        expect(res.body.account).toHaveProperty('platform', 'mock');
        expect(res.body.account).toHaveProperty('userId', userId);

        // Verify in DB
        const account = await prisma.socialAccount.findFirst({
            where: { userId, platform: 'mock' },
        });
        expect(account).toBeTruthy();
    });

    it('should fail callback without auth', async () => {
        const res = await request(app).get('/api/integrations/mock/callback?code=success');
        expect(res.statusCode).toEqual(401);
    });
});
