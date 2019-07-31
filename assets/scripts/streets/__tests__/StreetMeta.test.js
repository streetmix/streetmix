/* eslint-env jest */
import React from 'react'
import StreetMeta from '../StreetMeta'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'

jest.mock('../../streets/remix', () => {
  return {
    getRemixOnFirstEdit: () => {}
  }
})

jest.mock('../../app/load_resources', () => {})
jest.mock('../../app/initialization', () => {})
jest.mock('../../preinit/app_settings', () => {})

describe('StreetMeta', () => {
  it('renders without crashing', () => {
    const wrapper = renderWithReduxAndIntl(<StreetMeta />)
    expect(wrapper.asFragment()).toMatchSnapshot()
  })
})
