/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import BlockingError from '../BlockingError'
import { ERRORS } from '../errors'

jest.mock('../load_resources', () => {})
jest.mock('../../users/authentication', () => {})

describe('BlockingError', () => {
  const initialState = {
    errors: {
      errorType: ERRORS.NOT_FOUND
    },
    street: {}
  }

  it('renders', () => {
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
