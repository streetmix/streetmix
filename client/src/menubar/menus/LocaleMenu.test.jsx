import React from 'react'
import { vi } from 'vitest'
import { screen, act } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import { updateUnits } from '~/src/users/localization'
import { clearMenus } from '~/src/store/slices/menus'
import LocaleMenu from './LocaleMenu'

vi.mock('../../users/localization', () => ({
  updateUnits: vi.fn()
}))
vi.mock('../../store/slices/menus', () => ({
  default: {},
  clearMenus: vi.fn((id) => ({ type: 'MOCK_ACTION' }))
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

  it('handles locale selection', async () => {
    render(<LocaleMenu isActive={true} />, {
      initialState
    })

    // Clicking this first should not trigger any selection handler
    const selected = screen.getByText('English')
    await act(async () => {
      await userEvent.click(selected)
    })
    expect(selected.parentNode.getAttribute('aria-selected')).toBe('true')

    // Change the locale
    const selected2 = screen.getByText('Finnish')
    await act(async () => {
      await userEvent.click(selected2)
    })

    expect(selected.parentNode.getAttribute('aria-selected')).toBe('false')
    expect(selected2.parentNode.getAttribute('aria-selected')).toBe('true')

    expect(clearMenus).toBeCalledTimes(1)
  })
})
