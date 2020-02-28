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
      creator_id: 'foo'
    }
  }
}

describe('BlockingError', () => {
  it('renders NOT_FOUND', () => {
    const initialState = getInitialState(ERRORS.NOT_FOUND)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders SIGN_OUT', () => {
    const initialState = getInitialState(ERRORS.SIGN_OUT)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders NO_STREET', () => {
    const initialState = getInitialState(ERRORS.NO_STREET)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders FORCE_RELOAD_SIGN_IN', () => {
    const initialState = getInitialState(ERRORS.FORCE_RELOAD_SIGN_IN)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders FORCE_RELOAD_SIGN_OUT', () => {
    const initialState = getInitialState(ERRORS.FORCE_RELOAD_SIGN_OUT)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders FORCE_RELOAD_SIGN_OUT_401', () => {
    const initialState = getInitialState(ERRORS.FORCE_RELOAD_SIGN_OUT_401)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders STREET_DELETED_ELSEWHERE', () => {
    const initialState = getInitialState(ERRORS.STREET_DELETED_ELSEWHERE)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders NEW_STREET_SERVER_FAILURE', () => {
    const initialState = getInitialState(ERRORS.NEW_STREET_SERVER_FAILURE)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders ACCESS_DENIED', () => {
    const initialState = getInitialState(ERRORS.ACCESS_DENIED)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN', () => {
    const initialState = getInitialState(
      ERRORS.AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN
    )
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN', () => {
    const initialState = getInitialState(
      ERRORS.AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN
    )
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders AUTH_PROBLEM_API_PROBLEM', () => {
    const initialState = getInitialState(ERRORS.AUTH_PROBLEM_API_PROBLEM)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders GENERIC_ERROR', () => {
    const initialState = getInitialState(ERRORS.GENERIC_ERROR)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders UNSUPPORTED_BROWSER', () => {
    const initialState = getInitialState(ERRORS.UNSUPPORTED_BROWSER)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders STREET_404', () => {
    const initialState = getInitialState(ERRORS.STREET_404)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders STREET_404_BUT_LINK_TO_USER', () => {
    const initialState = getInitialState(ERRORS.STREET_404_BUT_LINK_TO_USER)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders STREET_410_BUT_LINK_TO_USER', () => {
    const initialState = getInitialState(ERRORS.STREET_410_BUT_LINK_TO_USER)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders CANNOT_CREATE_NEW_STREET_ON_PHONE', () => {
    const initialState = getInitialState(
      ERRORS.CANNOT_CREATE_NEW_STREET_ON_PHONE
    )
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders SIGN_IN_SERVER_FAILURE', () => {
    const initialState = getInitialState(ERRORS.SIGN_IN_SERVER_FAILURE)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders SIGN_IN_401', () => {
    const initialState = getInitialState(ERRORS.SIGN_IN_401)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders STREET_DATA_FAILURE', () => {
    const initialState = getInitialState(ERRORS.STREET_DATA_FAILURE)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders GALLERY_STREET_FAILURE', () => {
    const initialState = getInitialState(ERRORS.GALLERY_STREET_FAILURE)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders AUTH_PROBLEM_NO_ACCESS_TOKEN', () => {
    const initialState = getInitialState(ERRORS.AUTH_PROBLEM_NO_ACCESS_TOKEN)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders nothing if no error provided', () => {
    const initialState = getInitialState(null)
    const wrapper = renderWithReduxAndIntl(<BlockingError />, { initialState })
    expect(wrapper.container.firstChild).toBeNull()
  })
})
