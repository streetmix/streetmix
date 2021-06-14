/* eslint-env jest */
import React from 'react'
import { render } from '../../../../test/helpers/render'
import NewsletterDialog from '../NewsletterDialog'

describe('NewsletterDialog', () => {
  it('renders snapshot', () => {
    const { asFragment } = render(<NewsletterDialog />)
    expect(asFragment()).toMatchSnapshot()
  })

  it.todo('handles an email validating error')
  it.todo('disables a submit button while pending subscription')
  it.todo('displays content on success state')
  it.todo('displays content on error state from subscription endpoint')
})
