// In test environment, load test env vars if available.
process.loadEnvFile('.env.test')

process.env.NODE_ENV = 'test'
