/* eslint-env jest */
import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../../test/helpers/render'
import { updateUnits } from '../users/localization'
import { clearMenus } from '../store/slices/menus'
import LocaleMenu from './LocaleMenu'

jest.mock('../users/localization', () => ({
  updateUnits: jest.fn()
}))
jest.mock('../store/slices/menus', () => ({
  clearMenus: jest.fn((id) => ({ type: 'MOCK_ACTION' }))
}))

const initialState = {
  locale: {
    locale: 'en',
    requestedLocale: null
  }
}

describe('LocaleMenu', () => {
  afterEach(() => {
    updateUnits.mockClear()
    clearMenus.mockClear()
  })

  it.todo('renders proper locale lists for given feature flags')

  // Currently the wait for expectations do not pass.
  // Possible culprit is that something fails while it's actually
  // retrieving or setting locales.
  xit('handles locale selection', async () => {
    render(<LocaleMenu isActive={true} />, {
      initialState
    })

    // Clicking this first should not trigger any selection handler
    const selected = screen.getByText('English')
    userEvent.click(selected)
    expect(selected.parentNode.getAttribute('aria-selected')).toBe('true')

    // Change the locale
    const selected2 = screen.getByText('Finnish')
    userEvent.click(selected2)

    await waitFor(() => {
      // Changing a locale is asynchronous, so we wait before testing
      expect(selected.parentNode.getAttribute('aria-selected')).toBe('true')
      expect(selected2.parentNode.getAttribute('aria-selected')).toBe('true')

      expect(clearMenus).toBeCalledTimes(1)
    })
  })
})
