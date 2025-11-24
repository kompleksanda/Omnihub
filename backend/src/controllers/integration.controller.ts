import { Request, Response } from 'express';
import { integrationManager } from '../integrations/integration.manager';
import prisma from '../prisma';

export const startAuth = (req: Request, res: Response) => {
    const { platform } = req.params;
    const adapter = integrationManager.getAdapter(platform);

    if (!adapter) {
        return res.status(404).json({ message: 'Platform not supported' });
    }

    const authUrl = adapter.getAuthUrl();
    res.redirect(authUrl);
};

export const handleCallback = async (req: Request, res: Response) => {
    const { platform } = req.params;
    const { code } = req.query;
    // @ts-ignore
    const userId = req.user?.userId; // Assumes authMiddleware is used

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const adapter = integrationManager.getAdapter(platform);

    if (!adapter) {
        return res.status(404).json({ message: 'Platform not supported' });
    }

    try {
        const authResult = await adapter.authenticate(code as string);

        // Save or update SocialAccount
        const socialAccount = await prisma.socialAccount.upsert({
            where: {
                platform_platformId: {
                    platform: adapter.platform,
                    platformId: authResult.platformId,
                },
            },
            update: {
                accessToken: authResult.accessToken,
                refreshToken: authResult.refreshToken,
                expiresAt: authResult.expiresAt,
                metadata: authResult.metadata || {},
            },
            create: {
                platform: adapter.platform,
                platformId: authResult.platformId,
                accessToken: authResult.accessToken,
                refreshToken: authResult.refreshToken,
                expiresAt: authResult.expiresAt,
                metadata: authResult.metadata || {},
                userId: userId,
            },
        });

        res.json({ message: 'Integration successful', account: socialAccount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Authentication failed' });
    }
};
