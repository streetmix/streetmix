import React from 'react'
import { vi } from 'vitest'
import MockAdapter from 'axios-mock-adapter'

import { render } from '~/test/helpers/render'
import apiClient from '~/src/util/api'
import WelcomePanel from './WelcomePanel'

vi.mock('../../users/authentication')
vi.mock('../mode')

describe('WelcomePanel', () => {
  let apiMock: MockAdapter

  beforeEach(() => {
    apiMock = new MockAdapter(apiClient.client)
  })

  afterEach(() => {
    apiMock.restore()
  })

  it('does not show if app is read-only', () => {
    const { container } = render(<WelcomePanel />, {
      initialState: {
        app: {
          readOnly: true
        }
      }
    })

    expect(container).toBeEmptyDOMElement()
  })
})
