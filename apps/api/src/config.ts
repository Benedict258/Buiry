// Environment configuration for Railway deployment
export const config = {
  port: parseInt(process.env.PORT || '3001'),
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || '',
  apiKey: process.env.API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  suiNetwork: process.env.SUI_NETWORK || 'testnet',
  buiryPackageId: process.env.BUIRY_PACKAGE_ID || '0x411d197869a261a42911ac454e063231301c18d0c0f9289f3a4c414db016e60e',
  memwalUrl: process.env.MEMWAL_URL || 'http://localhost:8000',
  memwalKey: process.env.MEMWAL_PRIVATE_KEY || '',
  memwalAccountId: process.env.MEMWAL_ACCOUNT_ID || '',
  suiPrivateKey: process.env.SUI_PRIVATE_KEY || '',
  sealPackageId: process.env.SEAL_PACKAGE_ID || '0x4cb081ee75d2872e5b2e0b2c733a09422fb4cd72e1c36b9aec2c27e3168b8009',
  sealServerConfigs: parseSealServers(process.env.SEAL_SERVER_CONFIGS),
  nodeEnv: process.env.NODE_ENV || 'development',
  sslCert: process.env.SSL_CERT || '',
  sslKey: process.env.SSL_KEY || '',
  sentryDsn: process.env.SENTRY_DSN || '',
  logLevel: process.env.LOG_LEVEL || 'info',
};

function parseSealServers(raw: string | undefined): { objectId: string; weight: number }[] {
  if (!raw) return [];
  try {
    return raw.split(',').map((entry) => {
      const [objectId, weightStr] = entry.split(':');
      return { objectId: objectId.trim(), weight: parseInt(weightStr || '1', 10) };
    });
  } catch {
    return [];
  }
}
