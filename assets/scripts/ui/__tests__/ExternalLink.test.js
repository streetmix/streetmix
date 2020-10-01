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
    const {
      asFragment
    } = renderWithReduxAndIntl(
      <ExternalLink href="https://example.com">foo</ExternalLink>,
      { initialState: initialStateForOnline }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders an <a> element with element child', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <ExternalLink href="https://example.com">
        <div>foo</div>
      </ExternalLink>,
      { initialState: initialStateForOnline }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders string child without an <a> element in "no-internet" mode', () => {
    const {
      asFragment
    } = renderWithReduxAndIntl(
      <ExternalLink href="https://example.com">foo</ExternalLink>,
      { initialState: initialStateForOffline }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders element child without an <a> element in "no-internet" mode', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <ExternalLink href="https://example.com">
        <div>foo</div>
      </ExternalLink>,
      { initialState: initialStateForOffline }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should throw an error if href is not external', () => {
    expect(() =>
      renderWithReduxAndIntl(
        <ExternalLink href="https://streetmix.net">foo</ExternalLink>,
        { initialState: initialStateForOnline }
      )
    ).toThrow(ERRORS.INVALID_EXTERNAL_LINK)
  })

  it('renders an <a> element with mailto link', () => {
    const {
      asFragment
    } = renderWithReduxAndIntl(
      <ExternalLink href="mailto:hello@streetmix.net">foo</ExternalLink>,
      { initialState: initialStateForOnline }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should pass other props to <a> element', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <ExternalLink href="https://example.com" className="bar" title="foobar">
        foo
      </ExternalLink>,
      { initialState: initialStateForOnline }
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
