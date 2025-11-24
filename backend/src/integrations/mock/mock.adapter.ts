import { SocialAdapter, AuthResult } from '../social-adapter.interface';

export class MockAdapter implements SocialAdapter {
    platform = 'mock';

    getAuthUrl(): string {
        return 'http://localhost:3000/mock-auth?redirect_uri=http://localhost:5000/api/integrations/mock/callback';
    }

    async authenticate(code: string): Promise<AuthResult> {
        if (code === 'fail') {
            throw new Error('Authentication failed');
        }

        return {
            accessToken: 'mock_access_token_' + Date.now(),
            refreshToken: 'mock_refresh_token_' + Date.now(),
            expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
            platformId: 'mock_user_' + Math.floor(Math.random() * 1000),
            metadata: {
                username: 'mock_user',
            },
        };
    }
}
