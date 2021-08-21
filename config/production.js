module.exports = {
  app_host_port: process.env.APP_DOMAIN || 'streetmix.net',
  restapi: {
    protocol: 'https://',
    baseuri: '/api'
  },
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
      },
      // Heroku requires SSL connections to Postgres. As of the date of this
      // commit, hobby-tier and some some older database instances do not yet
      // enforce SSL, which can cause the app's database to throw the error "self
      // signed certificate." So we must enable SSL but also set `rejectUnauthorized`
      // to `false` to handle those app instances.
      // Additional info:
      // https://help.heroku.com/tickets/955239#event_5b8da58d-e65f-4f18-8744-e96c0b7507f6
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false
        }
      }
    }
  },
  stripe: {
    tier1_plan_id: process.env.TIER1_PLAN_ID || 'plan_Fc2wCyqj2Azpbm'
  }
}
