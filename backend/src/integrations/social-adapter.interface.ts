export interface AuthResult {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    platformId: string;
    metadata?: any;
}

export interface SocialAdapter {
    platform: string;
    getAuthUrl(): string;
    authenticate(code: string): Promise<AuthResult>;
    // Future methods for messaging and orders will go here
}
