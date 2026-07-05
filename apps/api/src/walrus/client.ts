import { WalrusClient } from '@mysten/walrus';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { SealClient } from '@mysten/seal';
import { DemType } from '@mysten/seal';
import { config } from '../config.js';

const NETWORK_URLS: Record<string, string> = {
  testnet: 'https://fullnode.testnet.sui.io',
  mainnet: 'https://fullnode.mainnet.sui.io',
  devnet: 'https://fullnode.devnet.sui.io',
};

export class BuiryWalrusClient {
  private client: WalrusClient | null = null;
  private connected = false;
  private suiClient: SuiJsonRpcClient;
  private sealClient: SealClient | null = null;
  private signer: any;

  constructor(
    private network: string = config.suiNetwork || 'testnet',
    private rpcUrl?: string,
    signer?: any,
  ) {
    this.signer = signer;
    this.suiClient = new SuiJsonRpcClient({
      url: this.rpcUrl || NETWORK_URLS[this.network] || NETWORK_URLS.testnet,
      network: this.network as 'testnet' | 'mainnet',
    });
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    try {
      this.client = new WalrusClient({
        network: this.network as 'testnet' | 'mainnet',
        suiClient: this.suiClient as never,
      });
      this.connected = true;
      console.log('[Walrus] Connected to', this.network);

      if (config.sealServerConfigs.length > 0) {
        try {
          this.sealClient = new SealClient({
            suiClient: this.suiClient as any,
            serverConfigs: config.sealServerConfigs,
          });
          console.log('[Walrus] SEAL client initialized');
        } catch (err) {
          console.warn('[Walrus] SEAL client init failed:', err);
        }
      }
    } catch (err) {
      console.warn('[Walrus] Connection failed:', err);
    }
  }

  private async getSigner() {
    const { Ed25519Keypair } = await import('@mysten/sui/keypairs/ed25519');
    const privateKey = process.env.SUI_PRIVATE_KEY;
    if (!privateKey) throw new Error('SUI_PRIVATE_KEY not set');
    return Ed25519Keypair.fromSecretKey(privateKey);
  }

  async uploadBlob(
    data: Buffer,
    metadata: Record<string, unknown>,
    signer?: any,
  ): Promise<{ blobId: string; blobUrl: string } | null> {
    if (!this.connected || !this.client) {
      console.warn('[Walrus] Not connected');
      return null;
    }
    try {
      const result = await this.client.writeBlob({
        blob: new Uint8Array(data),
        deletable: true,
        epochs: 10,
        signer: signer || this.signer || (await this.getSigner()),
        attributes: {
          buiry_type: String(metadata.buiry_type || 'dataset'),
          buiry_domain: String(metadata.buiry_domain || 'unknown'),
          buiry_workspace_id: String(metadata.buiry_workspace_id || 'unknown'),
          buiry_category: String(metadata.buiry_category || 'unknown'),
          buiry_sample_size: String(metadata.buiry_sample_size || '0'),
        },
      });
      console.log(`[Walrus] Uploaded blob: ${result.blobId}`);
      return {
        blobId: result.blobId,
        blobUrl: `https://aggregator.walrus-testnet.walrus.space/v1/${result.blobId}`,
      };
    } catch (err) {
      console.error('[Walrus] Upload failed:', err);
      return null;
    }
  }

  async downloadBlob(blobId: string, decrypt = false): Promise<Buffer | null> {
    if (!this.connected || !this.client) {
      console.warn('[Walrus] Not connected');
      return null;
    }
    try {
      const data = await this.client.readBlob({ blobId });
      const buffer = Buffer.from(data);
      if (decrypt) {
        return this.sealDecrypt(buffer, blobId);
      }
      return buffer;
    } catch (err) {
      console.error('[Walrus] Download failed:', err);
      return null;
    }
  }

  async getBlobMetadata(blobId: string): Promise<Record<string, unknown> | null> {
    if (!this.connected || !this.client) {
      return null;
    }
    try {
      const result = await this.client.getBlobMetadata({ blobId });
      return result as unknown as Record<string, unknown>;
    } catch (err) {
      console.error('[Walrus] Metadata fetch failed:', err);
      return null;
    }
  }

  async uploadBlobSealed(
    data: Buffer,
    metadata: Record<string, unknown>,
    signer?: any,
  ) {
    const encrypted = await this.sealEncrypt(
      data,
      metadata.buiry_workspace_id as string,
    );
    const result = await this.uploadBlob(Buffer.from(encrypted), metadata, signer);
    if (!result) return null;
    return { ...result, sealed: true };
  }

  async sealEncrypt(data: Buffer, identity: string): Promise<Buffer> {
    if (this.sealClient) {
      try {
        const result = await this.sealClient.encrypt({
          threshold: 1,
          packageId: config.sealPackageId,
          id: identity,
          data: new Uint8Array(data),
          demType: DemType.AesGcm256,
        });
        return Buffer.from(result.encryptedObject);
      } catch (err) {
        console.warn('[Walrus] SEAL encrypt failed, falling back to AES:', err);
      }
    }

    const crypto = await import('node:crypto');
    const key = crypto.createHash('sha256').update(identity).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const result = Buffer.alloc(1 + iv.length + authTag.length + encrypted.length);
    result[0] = 0x01;
    iv.copy(result, 1);
    authTag.copy(result, 1 + iv.length);
    encrypted.copy(result, 1 + iv.length + authTag.length);
    return result;
  }

  async sealDecrypt(encryptedData: Buffer, identity: string): Promise<Buffer> {
    if (this.sealClient && encryptedData[0] !== 0x01) {
      try {
        const signer = this.signer || (await this.getSigner());
        const sessionKey = await (await import('@mysten/seal')).SessionKey.create({
          address: signer.toSuiAddress(),
          packageId: config.sealPackageId,
          ttlMin: 5,
          signer,
          suiClient: this.suiClient as any,
        });
        const { Transaction } = await import('@mysten/sui/transactions');
        const tx = new Transaction();
        tx.moveCall({
          target: `${config.sealPackageId}::seal::approve`,
          arguments: [tx.pure.string(identity)],
        });
        const txBytes = await tx.build({ client: this.suiClient as any });
        const decrypted = await this.sealClient.decrypt({
          data: new Uint8Array(encryptedData),
          sessionKey,
          txBytes,
        });
        return Buffer.from(decrypted);
      } catch (err) {
        console.warn('[Walrus] SEAL decrypt failed, trying AES fallback:', err);
      }
    }

    if (encryptedData[0] === 0x01) {
      try {
        const crypto = await import('node:crypto');
        const key = crypto.createHash('sha256').update(identity).digest();
        const iv = encryptedData.subarray(1, 13);
        const authTag = encryptedData.subarray(13, 29);
        const ct = encryptedData.subarray(29);
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        return Buffer.concat([decipher.update(ct), decipher.final()]);
      } catch (err) {
        console.error('[Walrus] AES decrypt failed:', err);
        throw err;
      }
    }

    throw new Error('[Walrus] Cannot decrypt: no SEAL client and no AES marker');
  }

  isAvailable(): boolean {
    return this.connected && this.client !== null;
  }
}
