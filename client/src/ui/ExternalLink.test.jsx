import React from 'react'

import { render } from '~/test/helpers/render'
import ExternalLink from './ExternalLink'

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
  it('renders an <a> element with string child', () => {
    const { asFragment } = render(
      <ExternalLink href="https://example.com">foo</ExternalLink>,
      {
        initialState: initialStateForOnline
      }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders an <a> element with element child', () => {
    const { asFragment } = render(
      <ExternalLink href="https://example.com">
        <div>foo</div>
      </ExternalLink>,
      { initialState: initialStateForOnline }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders string child without an <a> element in "offline" mode', () => {
    const { asFragment } = render(
      <ExternalLink href="https://example.com">foo</ExternalLink>,
      {
        initialState: initialStateForOffline
      }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders element child without an <a> element in "offline" mode', () => {
    const { asFragment } = render(
      <ExternalLink href="https://example.com">
        <div>foo</div>
      </ExternalLink>,
      { initialState: initialStateForOffline }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders an <a> element with mailto link', () => {
    const { asFragment } = render(
      <ExternalLink href="mailto:hello@streetmix.net">foo</ExternalLink>,
      { initialState: initialStateForOnline }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should pass other props to <a> element', () => {
    const { asFragment } = render(
      <ExternalLink href="https://example.com" className="bar" title="foobar">
        foo
      </ExternalLink>,
      { initialState: initialStateForOnline }
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
