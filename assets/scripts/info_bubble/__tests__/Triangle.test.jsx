/* eslint-env jest */
import React from 'react'
import { render } from '@testing-library/react'
import Triangle from '../Triangle'

describe('Triangle', () => {
  it('renders an unhighlighted triangle by default', () => {
    const { asFragment } = render(<Triangle />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders an highlighted triangle', () => {
    const { asFragment } = render(<Triangle highlight={true} />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders an unhighlighted triangle', () => {
    const { asFragment } = render(<Triangle highlight={false} />)
    expect(asFragment()).toMatchSnapshot()
  })
})
