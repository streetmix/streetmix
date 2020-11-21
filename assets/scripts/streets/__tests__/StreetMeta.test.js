/* eslint-env jest */
import React from 'react'
import StreetMeta from '../StreetMeta'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'

jest.mock('../../app/load_resources', () => {})
jest.mock('../../app/initialization', () => {})
jest.mock('../../preinit/app_settings', () => {})

describe('StreetMeta', () => {
  it('renders without crashing', () => {
    const { asFragment } = renderWithReduxAndIntl(<StreetMeta />)
    expect(asFragment()).toMatchSnapshot()
  })
})
