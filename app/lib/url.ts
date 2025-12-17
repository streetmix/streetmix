export const appURL =
  process.env.APP_DOMAIN === 'localhost'
    ? new URL(
        `${process.env.APP_PROTOCOL}://${process.env.APP_DOMAIN}:${process.env.PORT}`
      )
    : new URL(`${process.env.APP_PROTOCOL}://${process.env.APP_DOMAIN}`)
