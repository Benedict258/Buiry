import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { Transaction } from '@mysten/sui/transactions';
import { config } from '../config.js';

const NETWORK_URLS: Record<string, string> = {
  testnet: 'https://fullnode.testnet.sui.io',
  mainnet: 'https://fullnode.mainnet.sui.io',
  devnet: 'https://fullnode.devnet.sui.io',
};

export class BuirySuiClient {
  private suiClient: SuiJsonRpcClient;
  private network: string;

  constructor(network: string = config.suiNetwork || 'testnet') {
    this.network = network;
    this.suiClient = new SuiJsonRpcClient({
      url: NETWORK_URLS[network] || NETWORK_URLS.testnet,
      network: network as 'testnet' | 'mainnet',
    });
  }

  getSuiClient(): SuiJsonRpcClient {
    return this.suiClient;
  }

  private async getSigner() {
    const { Ed25519Keypair } = await import('@mysten/sui/keypairs/ed25519');
    const privateKey = config.suiPrivateKey || process.env.SUI_PRIVATE_KEY;
    if (!privateKey) throw new Error('SUI_PRIVATE_KEY not set');
    return Ed25519Keypair.fromSecretKey(privateKey);
  }

  async registerWorkspace(
    ownerAddress: string,
    workspaceName: string,
  ): Promise<{ digest: string } | null> {
    try {
      const signer = await this.getSigner();
      const tx = new Transaction();
      tx.moveCall({
        target: `${config.buiryPackageId}::workspace::register`,
        arguments: [tx.pure.string(workspaceName), tx.pure.address(ownerAddress)],
      });
      const result = await this.suiClient.signAndExecuteTransaction({
        transaction: tx,
        signer,
        options: { showEffects: true },
      } as any);
      console.log('[Sui] Workspace registered:', result.digest);
      return { digest: result.digest };
    } catch (err) {
      console.error('[Sui] registerWorkspace failed:', err);
      return null;
    }
  }

  async registerDataset(
    workspaceId: string,
    blobId: string,
    category: string,
    domain: string,
    sampleSize: number,
  ): Promise<{ digest: string; objectId?: string } | null> {
    try {
      const signer = await this.getSigner();
      const tx = new Transaction();
      tx.moveCall({
        target: `${config.buiryPackageId}::dataset::register`,
        arguments: [
          tx.pure.string(workspaceId),
          tx.pure.string(blobId),
          tx.pure.string(category),
          tx.pure.string(domain),
          tx.pure.u64(sampleSize),
        ],
      });
      const result = await this.suiClient.signAndExecuteTransaction({
        transaction: tx,
        signer,
        options: { showEffects: true, showObjectChanges: true },
      } as any);
      console.log('[Sui] Dataset registered:', result.digest);

      let objectId: string | undefined;
      if (result.objectChanges) {
        const created = (result.objectChanges as any[]).find(
          (c: any) => c.type === 'created',
        );
        if (created) objectId = created.objectId;
      }

      return { digest: result.digest, objectId };
    } catch (err) {
      console.error('[Sui] registerDataset failed:', err);
      return null;
    }
  }

  async listOnMarketplace(
    datasetId: string,
    priceMist: number,
  ): Promise<{ digest: string; listingId?: string } | null> {
    try {
      const signer = await this.getSigner();
      const tx = new Transaction();
      tx.moveCall({
        target: `${config.buiryPackageId}::marketplace::list`,
        arguments: [tx.pure.string(datasetId), tx.pure.u64(priceMist)],
      });
      const result = await this.suiClient.signAndExecuteTransaction({
        transaction: tx,
        signer,
        options: { showEffects: true, showObjectChanges: true },
      } as any);
      console.log('[Sui] Listed on marketplace:', result.digest);

      let listingId: string | undefined;
      if (result.objectChanges) {
        const created = (result.objectChanges as any[]).find(
          (c: any) => c.type === 'created',
        );
        if (created) listingId = created.objectId;
      }

      return { digest: result.digest, listingId };
    } catch (err) {
      console.error('[Sui] listOnMarketplace failed:', err);
      return null;
    }
  }
}
