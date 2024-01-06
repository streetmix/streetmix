/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../../../test/helpers/render'
import EnvironmentButton from '../EnvironmentButton'
import { toggleToolbox } from '../../store/slices/ui'

jest.mock('../../store/slices/ui', () => ({
  // We don't use these actions for anything, but they must return
  // a plain object or the dispatch() throws an error
  toggleToolbox: jest.fn((id) => ({ type: 'MOCK_ACTION' }))
}))

// Note: "default" render snapshot is covered by a test on the parent
// component. This test only covers interactions on this component.
describe('EnvironmentButton', () => {
  it('handles click action', async () => {
    render(<EnvironmentButton />)

    // Click the tools button
    await userEvent.click(screen.getByTitle('Environment editor'))

    expect(toggleToolbox).toBeCalled()
  })
})
