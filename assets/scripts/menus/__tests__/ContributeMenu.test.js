/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import ContributeMenu from '../ContributeMenu'

describe('ContributeMenu', () => {
  it('renders', () => {
    const { asFragment } = renderWithReduxAndIntl(
      <ContributeMenu isActive={true} />
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
