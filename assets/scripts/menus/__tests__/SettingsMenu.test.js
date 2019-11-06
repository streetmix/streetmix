/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import { SettingsMenu } from '../SettingsMenu'

jest.mock('../../users/localization', () => {})

describe('SettingsMenu', () => {
  it('renders without crashing', () => {
    const wrapper = renderWithReduxAndIntl(<SettingsMenu />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
