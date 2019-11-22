/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import DonateDialog from '../DonateDialog'

describe('DonateDialog', () => {
  it('renders', () => {
    const wrapper = renderWithReduxAndIntl(
      <DonateDialog closeDialog={jest.fn()} />
    )
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
