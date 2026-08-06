import { vi } from 'vitest'
import request from 'supertest'

import { getFromTransifex } from '@streetmix/i18n'
import { setupMockServer } from '../../../test/setup-mock-server.ts'
import * as translate from '../translate.ts'

import type { Mock } from 'vitest'

const readFileMock = vi.hoisted(() => vi.fn())

vi.mock('node:fs/promises', () => ({
  readFile: readFileMock,
}))

vi.mock('@streetmix/i18n', () => ({
  getFromTransifex: vi.fn(),
}))

const sampleTranslation = {
  dialogs: {
    welcome: {
      heading: 'Welcome to Streetmix.',
    },
  },
}

describe('get api/v1/translate', function () {
  const app = setupMockServer((app) => {
    app.get('/api/v1/translate/:locale_code/:resource_name', translate.get)
  })

  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.TRANSIFEX_API_TOKEN
  })

  it('returns translation from local file when locale is en', () => {
    readFileMock.mockResolvedValueOnce(JSON.stringify(sampleTranslation))

    return request(app)
      .get('/api/v1/translate/en/main')
      .then((response) => {
        expect(response.statusCode).toEqual(200)
        expect(response.get('Content-Type')?.toLowerCase()).toEqual(
          'application/json; charset=utf-8'
        )
        expect(response.body.dialogs.welcome.heading).toEqual(
          'Welcome to Streetmix.'
        )
        expect(readFileMock).toHaveBeenCalledTimes(1)
        expect(getFromTransifex).not.toHaveBeenCalled()
        return
      })
  })

  it('returns translation from local file when API token is missing', () => {
    readFileMock.mockResolvedValueOnce(JSON.stringify(sampleTranslation))

    return request(app)
      .get('/api/v1/translate/fr/main')
      .then((response) => {
        expect(response.statusCode).toEqual(200)
        expect(response.body.dialogs.welcome.heading).toEqual(
          'Welcome to Streetmix.'
        )
        expect(readFileMock).toHaveBeenCalledTimes(1)
        expect(getFromTransifex).not.toHaveBeenCalled()
        return
      })
  })

  it('returns translation from Transifex when token is available for non-en locale', () => {
    process.env.TRANSIFEX_API_TOKEN = 'token-for-tests'
    ;(getFromTransifex as unknown as Mock).mockResolvedValueOnce(
      sampleTranslation
    )

    return request(app)
      .get('/api/v1/translate/es/main')
      .then((response) => {
        expect(response.statusCode).toEqual(200)
        expect(response.body.dialogs.welcome.heading).toEqual(
          'Welcome to Streetmix.'
        )
        expect(getFromTransifex).toHaveBeenCalledWith(
          'es',
          'main',
          'token-for-tests'
        )
        expect(readFileMock).not.toHaveBeenCalled()
        return
      })
  })
})
