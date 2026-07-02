// Walrus Client — Dataset blob storage
// All Walrus calls go through this single file.
// Provides: uploadBlob, downloadBlob, getBlobMetadata
import { WalrusClient } from '@mysten/walrus';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { config } from '../config.js';

const NETWORK_URLS: Record<string, string> = {
  testnet: 'https://fullnode.testnet.sui.io',
  mainnet: 'https://fullnode.mainnet.sui.io',
  devnet: 'https://fullnode.devnet.sui.io',
};

export class BuiryWalrusClient {
  private client: WalrusClient | null = null;
  private connected = false;

  constructor(
    private network: string = config.suiNetwork || 'testnet',
    private rpcUrl?: string,
  ) {}

  async connect(): Promise<void> {
    if (this.connected) return;
    try {
      const suiClient = new SuiJsonRpcClient({
        url: this.rpcUrl || NETWORK_URLS[this.network] || NETWORK_URLS.testnet,
        network: this.network as 'testnet' | 'mainnet',
      });
      this.client = new WalrusClient({
        network: this.network as 'testnet' | 'mainnet',
        suiClient: suiClient as never,
      });
      this.connected = true;
      console.log('[Walrus] Connected to', this.network);
    } catch (err) {
      console.warn('[Walrus] Connection failed:', err);
    }
  }

  async uploadBlob(data: Buffer, metadata: Record<string, unknown>): Promise<{ blobId: string } | null> {
    if (!this.connected || !this.client) {
      console.warn('[Walrus] Not connected — uploadBlob unavailable');
      return null;
    }
    // TODO: Implement full write flow (register → certify → store)
    // Placeholder: returns mock blob ID
    console.warn('[Walrus] uploadBlob not yet implemented');
    return { blobId: `blob_${Date.now()}` };
  }

  async downloadBlob(blobId: string): Promise<Buffer | null> {
    if (!this.connected || !this.client) {
      console.warn('[Walrus] Not connected — downloadBlob unavailable');
      return null;
    }
    // TODO: Implement read flow
    console.warn('[Walrus] downloadBlob not yet implemented');
    return null;
  }

  async getBlobMetadata(blobId: string): Promise<Record<string, unknown> | null> {
    if (!this.connected || !this.client) {
      console.warn('[Walrus] Not connected — getBlobMetadata unavailable');
      return null;
    }
    // TODO: Implement metadata retrieval
    console.warn('[Walrus] getBlobMetadata not yet implemented');
    return null;
  }

  isAvailable(): boolean {
    return this.connected && this.client !== null;
  }
}
