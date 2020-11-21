/* eslint-env jest */
import React from 'react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import FeatureFlagDialog from '../FeatureFlagDialog'

// Mock flag data
jest.mock('../../../../app/data/flags', () => ({
  FOO_BAR: {
    label: 'FOO_BAR',
    defaultValue: true
  },
  BAZ_QUX: {
    label: 'BAZ_QUX',
    defaultValue: true
  },
  FOO_BAZ: {
    label: 'FOO_BAZ',
    defaultValue: true
  },
  BAZ_BAR: {
    label: 'BAZ_BAR',
    defaultValue: true,
    enabled: false
  }
}))

const initialState = {
  flags: {
    FOO_BAR: { value: true, source: 'initial' },
    BAZ_QUX: { value: false, source: 'initial' },
    FOO_BAZ: { value: true, source: 'initial' },
    BAZ_BAR: { value: false, source: 'initial' }
  }
}

describe('FeatureFlagDialog', () => {
  it('renders', () => {
    const { asFragment } = renderWithReduxAndIntl(<FeatureFlagDialog />, {
      initialState
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it.todo('renders a disabled flag')
  it.todo('renders a flag whose value differs from the default value')
  it.todo('sets a feature flag when the checkbox is clicked')
  it.todo('sets a feature flag when the label is clicked')
  it.todo('closes the dialog when "Close" button is clicked')
})
