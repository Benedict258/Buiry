// Sui Client — Blockchain contract interactions
// Provides: registerWorkspace, registerDataset, listOnMarketplace
// Uses @mysten/sui for transaction building
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { Transaction } from '@mysten/sui/transactions';
import { config } from '../config.js';

const NETWORK_URLS: Record<string, string> = {
  testnet: 'https://fullnode.testnet.sui.io',
  mainnet: 'https://fullnode.mainnet.sui.io',
  devnet: 'https://fullnode.devnet.sui.io',
};

export class BuirySuiClient {
  private client: SuiJsonRpcClient;
  private network: string;

  constructor(network: string = config.suiNetwork || 'testnet') {
    this.network = network;
    this.client = new SuiJsonRpcClient({
      url: NETWORK_URLS[network] || NETWORK_URLS.testnet,
      network: network as 'testnet' | 'mainnet',
    });
  }

  getSuiClient(): SuiJsonRpcClient {
    return this.client;
  }

  async registerWorkspace(name: string, address: string): Promise<Record<string, unknown>> {
    // TODO: Build and execute Move call to register workspace on-chain
    const tx = new Transaction();
    tx.moveCall({
      target: `${config.buiryPackageId}::workspace::register`,
      arguments: [tx.pure.string(name), tx.pure.address(address)],
    });
    console.warn('[Sui] registerWorkspace — transaction built, signing not implemented');
    return { status: 'built', name, address };
  }

  async registerDataset(listing: Record<string, unknown>): Promise<Record<string, unknown>> {
    // TODO: Build and execute Move call to register dataset on-chain
    const tx = new Transaction();
    const datasetName = (listing.name as string) || 'unnamed';
    const workspaceId = (listing.workspaceId as string) || '';
    tx.moveCall({
      target: `${config.buiryPackageId}::dataset::register`,
      arguments: [tx.pure.string(datasetName), tx.pure.string(workspaceId)],
    });
    console.warn('[Sui] registerDataset — transaction built, signing not implemented');
    return { status: 'built', ...listing };
  }

  async listOnMarketplace(datasetId: string, price: number): Promise<Record<string, unknown>> {
    // TODO: Build and execute Move call to list dataset on marketplace
    const tx = new Transaction();
    tx.moveCall({
      target: `${config.buiryPackageId}::marketplace::list`,
      arguments: [tx.pure.string(datasetId), tx.pure.u64(price)],
    });
    console.warn('[Sui] listOnMarketplace — transaction built, signing not implemented');
    return { status: 'built', datasetId, price, listingId: `lst_${Date.now()}` };
  }
}
