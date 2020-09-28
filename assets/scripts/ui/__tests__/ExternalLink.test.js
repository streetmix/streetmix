/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import ExternalLink from '../ExternalLink'
import { ERRORS } from '../../../../lib/util'

const initialStateForOnline = {
  system: {
    noInternet: false
  }
}

const initialStateForOffline = {
  system: {
    noInternet: true
  }
}

describe('ExternalLink', () => {
  beforeAll(() => {
    global.window = Object.create(window)

    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'streetmix.net'
      }
    })
  })

  it('renders an <a> element with string child', () => {
    const wrapper = renderWithReduxAndIntl(
      <ExternalLink href="https://example.com">foo</ExternalLink>,
      { initialState: initialStateForOnline }
    )
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders an <a> element with element child', () => {
    const wrapper = renderWithReduxAndIntl(
      <ExternalLink href="https://example.com">
        <div>foo</div>
      </ExternalLink>,
      { initialState: initialStateForOnline }
    )
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders string child without an <a> element in "no-internet" mode', () => {
    const wrapper = renderWithReduxAndIntl(
      <ExternalLink href="https://example.com">foo</ExternalLink>,
      { initialState: initialStateForOffline }
    )
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders element child without an <a> element in "no-internet" mode', () => {
    const wrapper = renderWithReduxAndIntl(
      <ExternalLink href="https://example.com">
        <div>foo</div>
      </ExternalLink>,
      { initialState: initialStateForOffline }
    )
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('should throw an error if href is not external', () => {
    expect(
      () => renderWithReduxAndIntl(
        <ExternalLink href="https://streetmix.net">
          <div>foo</div>
        </ExternalLink>,
        { initialState: initialStateForOnline }
      )
    ).toThrow(ERRORS.INVALID_EXTERNAL_LINK)
  })
})
