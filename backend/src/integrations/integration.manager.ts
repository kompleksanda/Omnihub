import { SocialAdapter } from './social-adapter.interface';

class IntegrationManager {
    private adapters: Map<string, SocialAdapter> = new Map();

    register(adapter: SocialAdapter) {
        this.adapters.set(adapter.platform, adapter);
    }

    getAdapter(platform: string): SocialAdapter | undefined {
        return this.adapters.get(platform);
    }

    getAllAdapters(): SocialAdapter[] {
        return Array.from(this.adapters.values());
    }
}

export const integrationManager = new IntegrationManager();
