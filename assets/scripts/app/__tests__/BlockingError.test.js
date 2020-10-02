/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import BlockingError from '../BlockingError'
import { ERRORS } from '../errors'

function getInitialState (errorType) {
  return {
    errors: {
      errorType: errorType
    },
    street: {
      creatorId: 'foo'
    }
  }
}

describe('BlockingError', () => {
  it.each(Object.keys(ERRORS))('renders %s', (error) => {
    const initialState = getInitialState(ERRORS[error])
    const { asFragment } = renderWithReduxAndIntl(<BlockingError />, {
      initialState
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders nothing if no error provided', () => {
    const initialState = getInitialState(null)
    const { container } = renderWithReduxAndIntl(<BlockingError />, {
      initialState
    })
    expect(container.firstChild).toBeNull()
  })
})
