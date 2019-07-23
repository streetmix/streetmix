require('dotenv').config()

module.exports = {
  'development': {
    'database': 'streetmix_dev',
    'host': process.env.PGHOST || '127.0.0.1',
    'port': process.env.PGPORT || 5432,
    'dialect': 'postgres'
  },
  'test': {
    'database': 'streetmix_test',
    'host': process.env.PGHOST || '127.0.0.1',
    'port': process.env.PGPORT || 5432,
    'dialect': 'postgres'
  },
  'staging': {
    'use_env_variable': 'DATABASE_URL',
    'dialect': 'postgres'
  },
  'production': {
    'use_env_variable': 'DATABASE_URL',
    'dialect': 'postgres'
  }
}
