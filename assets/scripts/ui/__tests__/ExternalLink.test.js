/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import ExternalLink from '../ExternalLink'

const initialStateForOnline = {
  system: {
    offline: false
  }
}

const initialStateForOffline = {
  system: {
    offline: true
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

  it('renders string child without an <a> element in "offline" mode', () => {
    const {
      asFragment
    } = renderWithReduxAndIntl(
      <ExternalLink href="https://example.com">foo</ExternalLink>,
      { initialState: initialStateForOffline }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders element child without an <a> element in "offline" mode', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <ExternalLink href="https://example.com">
        <div>foo</div>
      </ExternalLink>,
      { initialState: initialStateForOffline }
    )
    expect(asFragment()).toMatchSnapshot()
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
