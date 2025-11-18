import React from 'react'
import { vi } from 'vitest'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { render } from '~/test/helpers/render'
import { clearMenus } from '~/src/store/slices/menus'
import LocaleMenu from './LocaleMenu'

vi.mock('../../store/slices/menus', () => ({
  default: {},
  clearMenus: vi.fn(() => ({ type: 'MOCK_ACTION' }))
}))

const initialState = {
  locale: {
    locale: 'en',
    requestedLocale: null
  }
}

describe('LocaleMenu', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it.todo('renders proper locale lists for given feature flags')

  it('handles locale selection', async () => {
    render(<LocaleMenu isActive />, {
      initialState
    })

    // Clicking this first should not trigger any selection handler
    const selected = screen.getByText('English')
    await userEvent.click(selected)
    expect(selected.parentElement?.getAttribute('aria-checked')).toBe('true')

    // Change the locale
    const selected2 = screen.getByText('Finnish')
    await userEvent.click(selected2)

    expect(selected.parentElement?.getAttribute('aria-checked')).toBe('false')
    expect(selected2.parentElement?.getAttribute('aria-checked')).toBe('true')

    expect(clearMenus).toBeCalledTimes(1)
  })
})
