import express from 'express'
import request from 'supertest'
import { vi } from 'vitest'

import type { NextFunction, Request, Response } from 'express'

const {
  authMock,
  changelogGetMock,
  paymentsPostMock,
  geoipGetMock,
  imagesGetMock,
  cspReportPostMock,
  coilGetMock,
  coilCallbackMock,
  coilConnectUserMock,
  patreonGetMock,
  patreonCallbackMock,
  patreonConnectUserMock,
  patreonWebhookMock,
  refreshLoginTokenPostMock,
  auth0SignInCallbackGetMock,
} = vi.hoisted(() => {
  const ok = (label: string) =>
    vi.fn((_req: Request, res: Response) => {
      res.status(200).json({ route: label })
    })

  const nextOnly = () =>
    vi.fn((_req: Request, _res: Response, next: NextFunction) => {
      next()
    })

  return {
    authMock: vi.fn(() => {
      return (_req: Request, _res: Response, next: NextFunction) => {
        next()
      }
    }),
    changelogGetMock: ok('services.changelog.get'),
    paymentsPostMock: ok('services.payments.post'),
    geoipGetMock: ok('services.geoip.get'),
    imagesGetMock: ok('services.images.get'),
    cspReportPostMock: vi.fn((_req: Request, res: Response) => {
      res.status(204).end()
    }),
    coilGetMock: ok('services.integrations.coil.get'),
    coilCallbackMock: nextOnly(),
    coilConnectUserMock: ok('services.integrations.coil.connectUser'),
    patreonGetMock: ok('services.integrations.patreon.get'),
    patreonCallbackMock: nextOnly(),
    patreonConnectUserMock: ok('services.integrations.patreon.connectUser'),
    patreonWebhookMock: ok('services.integrations.patreon.webhook'),
    refreshLoginTokenPostMock: ok('controllers.refreshLoginToken.post'),
    auth0SignInCallbackGetMock: ok('controllers.auth0SignInCallback.get'),
  }
})

vi.mock('../authentication.ts', () => ({
  auth: authMock,
}))

vi.mock('../controllers/index.ts', () => ({
  refreshLoginToken: {
    post: refreshLoginTokenPostMock,
  },
  auth0SignInCallback: {
    get: auth0SignInCallbackGetMock,
  },
}))

vi.mock('../resources/services/index.ts', () => ({
  changelog: {
    get: changelogGetMock,
  },
  payments: {
    post: paymentsPostMock,
  },
  geoip: {
    get: geoipGetMock,
  },
  images: {
    get: imagesGetMock,
  },
  cspReport: {
    post: cspReportPostMock,
  },
  integrations: {
    coil: {
      get: coilGetMock,
      callback: coilCallbackMock,
      connectUser: coilConnectUserMock,
    },
    patreon: {
      get: patreonGetMock,
      callback: patreonCallbackMock,
      connectUser: patreonConnectUserMock,
      webhook: patreonWebhookMock,
    },
  },
}))

import serviceRoutes from '../service_routes.ts'

describe('service_routes router wiring', () => {
  const app = express()
  app.use('/services', serviceRoutes)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('routes to changelog endpoint', async () => {
    const response = await request(app).get('/services/changelog')

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ route: 'services.changelog.get' })
    expect(changelogGetMock).toHaveBeenCalledTimes(1)
  })

  it('routes to authenticated images endpoint', async () => {
    const response = await request(app).get('/services/images')

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ route: 'services.images.get' })
    expect(imagesGetMock).toHaveBeenCalledTimes(1)
  })

  it('handles csp report payload', async () => {
    const response = await request(app)
      .post('/services/csp-report')
      .set('Content-Type', 'application/csp-report')
      .send(
        JSON.stringify({
          'csp-report': {
            'blocked-uri': 'https://example.com',
          },
        })
      )

    expect(response.statusCode).toBe(204)
    expect(cspReportPostMock).toHaveBeenCalledTimes(1)
  })

  it('routes integration callback middleware chain', async () => {
    const response = await request(app).get(
      '/services/integrations/coil/callback'
    )

    expect(response.statusCode).toBe(200)
    expect(coilCallbackMock).toHaveBeenCalledTimes(1)
    expect(coilConnectUserMock).toHaveBeenCalledTimes(1)
    expect(response.body).toEqual({
      route: 'services.integrations.coil.connectUser',
    })
  })

  it('returns router-level 404 for unknown services routes', async () => {
    const response = await request(app).get('/services/does-not-exist')

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      status: 404,
      error: 'Not found. Did you mispell something?',
    })
  })
})
