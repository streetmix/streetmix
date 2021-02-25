/* eslint-env jest */
import React from 'react'
import StreetMeta from '../StreetMeta'
import { render } from '../../../../test/helpers/render'

jest.mock('../../app/load_resources', () => {})
jest.mock('../../app/initialization', () => {})
jest.mock('../../preinit/app_settings', () => {})

describe('StreetMeta', () => {
  it('renders without crashing', () => {
    const { asFragment } = render(<StreetMeta />)
    expect(asFragment()).toMatchSnapshot()
  })
})
