/* eslint-env jest */
import React from 'react'
import { fireEvent, wait } from '@testing-library/react'
import { renderWithReduxAndIntl } from '../../../../test/helpers/render'
import SettingsMenu from '../SettingsMenu'
import {
  SETTINGS_UNITS_IMPERIAL,
  SETTINGS_UNITS_METRIC
} from '../../users/constants'
import { updateUnits } from '../../users/localization'
import { changeLocale } from '../../store/actions/locale'
import { clearMenus } from '../../store/actions/menus'

jest.mock('../../users/localization', () => ({
  updateUnits: jest.fn()
}))
jest.mock('../../store/actions/locale', () => ({
  changeLocale: jest.fn((id) => (dispatch) =>
    Promise.resolve({ type: 'MOCK_ACTION' })
  )
}))
jest.mock('../../store/actions/menus', () => ({
  clearMenus: jest.fn((id) => ({ type: 'MOCK_ACTION' }))
}))

const initialState = {
  street: {
    units: SETTINGS_UNITS_METRIC
  },
  locale: {
    locale: 'en',
    requestedLocale: null
  },
  flags: {
    LOCALES_LEVEL_1: { value: true },
    LOCALES_LEVEL_2: { value: true },
    LOCALES_LEVEL_3: { value: true }
  }
}

describe('SettingsMenu', () => {
  afterEach(() => {
    updateUnits.mockClear()
    changeLocale.mockClear()
    clearMenus.mockClear()
  })

  it.todo('renders proper locale lists for given feature flags')

  it('handles locale selection', () => {
    const wrapper = renderWithReduxAndIntl(<SettingsMenu />, { initialState })

    // Clicking this first should not trigger any selection handler
    fireEvent.click(wrapper.getByText('English'))
    expect(changeLocale).toBeCalledTimes(0)

    fireEvent.click(wrapper.getByText('Finnish'))
    expect(changeLocale).toBeCalledTimes(1)
    expect(changeLocale).toBeCalledWith('fi')

    wait(() => {
      // This is called aynchronously, so we await the fireEvent.click(), above
      expect(clearMenus).toBeCalledTimes(1)
    })
  })

  it('handles metric units selection', () => {
    const wrapper = renderWithReduxAndIntl(<SettingsMenu />, {
      initialState: {
        ...initialState,
        // Set street units to imperial so that change is detected.
        street: {
          units: SETTINGS_UNITS_IMPERIAL
        }
      }
    })

    // Clicking this first should not trigger any selection handler
    fireEvent.click(wrapper.getByText('Imperial units', { exact: false }))
    expect(updateUnits).toBeCalledTimes(0)

    fireEvent.click(wrapper.getByText('Metric units', { exact: false }))
    expect(updateUnits).toBeCalledTimes(1)
    expect(updateUnits).toBeCalledWith(SETTINGS_UNITS_METRIC)

    expect(clearMenus).toBeCalledTimes(1)
  })

  it('handles imperial units selection', () => {
    const wrapper = renderWithReduxAndIntl(<SettingsMenu />, { initialState })

    // Clicking this first should not trigger any selection handler
    fireEvent.click(wrapper.getByText('Metric units', { exact: false }))
    expect(updateUnits).toBeCalledTimes(0)

    fireEvent.click(wrapper.getByText('Imperial units', { exact: false }))
    expect(updateUnits).toBeCalledTimes(1)
    expect(updateUnits).toBeCalledWith(SETTINGS_UNITS_IMPERIAL)

    expect(clearMenus).toBeCalledTimes(1)
  })
})
