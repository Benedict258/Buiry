// Environment configuration for Railway deployment
export const config = {
  port: parseInt(process.env.PORT || '3001'),
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || '',
  apiKey: process.env.API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  suiNetwork: process.env.SUI_NETWORK || 'testnet',
  buiryPackageId: process.env.BUIRY_PACKAGE_ID || '0x0',
  memwalUrl: process.env.MEMWAL_URL || 'http://localhost:8000',
  memwalKey: process.env.MEMWAL_PRIVATE_KEY || '',
  memwalAccountId: process.env.MEMWAL_ACCOUNT_ID || '',
  nodeEnv: process.env.NODE_ENV || 'development',
};
