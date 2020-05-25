/* eslint-env jest */
import React from 'react'
import { render } from '@testing-library/react'
import Triangle from '../Triangle'

describe('Triangle', () => {
  it('renders an unhighlighted triangle by default', () => {
    const wrapper = render(<Triangle />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders an highlighted triangle', () => {
    const wrapper = render(<Triangle highlight={true} />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })

  it('renders an unhighlighted triangle', () => {
    const wrapper = render(<Triangle highlight={false} />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
