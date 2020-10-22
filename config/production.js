module.exports = {
  app_host_port: 'streetmix.net',
  header_host_port: 'streetmix.net',
  restapi: {
    protocol: 'https://',
    baseuri: '/api'
  },
  facebook_app_id: '162729607241489',
  plausible: {
    domain: 'streetmix.net'
  },
  pinterest: '0175a0c658a16a45e7c1f6b7cefaa34f',
  db: {
    sequelize: {
      // The `url` property is documented in sequelize-cli readme but not in Sequelize core
      url: process.env.DATABASE_URL,
      logging: false,
      pool: {
        max: 12,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  },
  l10n: {
    use_local: true
  },
  stripe: {
    tier1_plan_id: process.env.TIER1_PLAN_ID || 'plan_Fc2wCyqj2Azpbm'
  }
}
