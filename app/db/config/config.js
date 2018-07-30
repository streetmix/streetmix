require('dotenv').config()

module.exports = {
  'development': {
    'username': process.env.PG_USERNAME,
    'password': process.env.PG_PASSWORD,
    'database': 'streetmix_dev',
    'host': '127.0.0.1',
    'port': 5432,
    'dialect': 'postgres'
  },
  'test': {
    'username': process.env.PG_USERNAME,
    'password': process.env.PG_PASSWORD,
    'database': 'streetmix_test',
    'host': '127.0.0.1',
    'port': 5432,
    'dialect': 'postgres'
  },
  'production': {
    'username': process.env.PG_USERNAME,
    'password': process.env.PG_PASSWORD,
    'database': 'streetmix',
    'host': '127.0.0.1',
    'port': 5432,
    'dialect': 'postgres'
  }
}
