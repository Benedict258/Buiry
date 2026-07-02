// MemWal Client — Encrypted session memory backend for cloud users
// All MemWal calls go through this single file.
// Provides: remember (writeSession), recall (semantic search)
// Fallback: If MemWal unavailable, use PostgreSQL directly
import { MemWal } from '@mysten/memwal';
import type { MemWalConfig, RememberResult, RecallResult } from '@mysten/memwal';
import { config } from '../config.js';

export class MemWalClient {
  private client: MemWal | null = null;
  private connected = false;

  constructor(
    private apiUrl: string = config.memwalUrl || 'http://localhost:8000',
    private apiKey: string = config.memwalKey || '',
    private accountId: string = config.memwalAccountId || '',
  ) {}

  async connect(): Promise<void> {
    if (this.connected) return;
    if (!this.apiKey) {
      console.warn('[MemWal] No API key configured — falling back to local storage');
      return;
    }
    try {
      this.client = MemWal.create({
        key: this.apiKey,
        serverUrl: this.apiUrl,
        accountId: this.accountId,
      });
      const health = await this.client.health();
      if (health.status === 'ok') {
        this.connected = true;
        console.log('[MemWal] Connected to', this.apiUrl);
      } else {
        console.warn('[MemWal] Server unhealthy — falling back to local storage');
      }
    } catch (err) {
      console.warn('[MemWal] Connection failed — falling back to local storage:', err);
    }
  }

  async writeSession(workspaceId: string, session: unknown): Promise<RememberResult | null> {
    if (!this.connected || !this.client) {
      console.warn('[MemWal] Not connected — skipping writeSession');
      return null;
    }
    const text = typeof session === 'string' ? session : JSON.stringify(session);
    return this.client.remember(text, workspaceId);
  }

  async readSessions(workspaceId: string, limit: number): Promise<RecallResult | null> {
    if (!this.connected || !this.client) {
      console.warn('[MemWal] Not connected — readSessions unavailable');
      return null;
    }
    return this.client.recall(workspaceId, limit);
  }

  async recall(workspaceId: string, query: string, topN: number): Promise<RecallResult | null> {
    if (!this.connected || !this.client) {
      console.warn('[MemWal] Not connected — recall unavailable');
      return null;
    }
    return this.client.recall(query, topN, workspaceId);
  }

  isAvailable(): boolean {
    return this.connected && this.client !== null;
  }
}
