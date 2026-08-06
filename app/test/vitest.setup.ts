// In test environment, load test env vars if available.
process.loadEnvFile('.env.test')

process.env.NODE_ENV = 'test'

// Logger can be noisy, mock it here.
vi.mock('../lib/logger.ts')
