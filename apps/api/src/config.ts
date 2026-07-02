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
  nodeEnv: process.env.NODE_ENV || 'development',
  sslCert: process.env.SSL_CERT || '',
  sslKey: process.env.SSL_KEY || '',
  sentryDsn: process.env.SENTRY_DSN || '',
  logLevel: process.env.LOG_LEVEL || 'info',
};
