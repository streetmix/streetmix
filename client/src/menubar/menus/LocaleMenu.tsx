import React from 'react'
import { FormattedMessage } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { changeLocale } from '~/src/store/slices/locale'
import { clearMenus } from '~/src/store/slices/menus'
import { DEFAULT_LOCALE } from '~/src/locales/constants'
import {
  getAvailableLocales,
  getActualLocaleFromRequested
} from '~/src/locales/locale'
import Icon from '~/src/ui/Icon'
import LoadingSpinner from '~/src/ui/LoadingSpinner'
import Menu, { type MenuProps } from './Menu'
import MenuItem from './MenuItem'

function LocaleMenu (props: MenuProps): React.ReactElement {
  const locale = useSelector((state) => state.locale.locale || DEFAULT_LOCALE)
  const requestedLocale = useSelector((state) => state.locale.requestedLocale)
  const dispatch = useDispatch()
  const filteredLocales = getAvailableLocales()
  const actuallySelectedLocale = getActualLocaleFromRequested(locale)

  async function selectLocale (newLocale: string): Promise<void> {
    if (locale === newLocale) return

    await dispatch(changeLocale(newLocale))

    // Hide the menu after a locale is selected.
    // Note: because the application's tree is actually remounted with new
    // locale context, the menu doesn't animate away. It just disappears.
    // We still have to dispatch the clearMenus() so that the Redux store
    // knows that the menu has closed.
    dispatch(clearMenus())
  }

  function renderLocaleOptions (): React.ReactElement[] {
    // Render each option
    return filteredLocales.map((locale) => {
      const selectedClassName =
        locale.value === actuallySelectedLocale
          ? 'menu-item-selected'
          : undefined

      return (
        <MenuItem
          key={locale.value}
          className={selectedClassName}
          onClick={() => {
            void selectLocale(locale.value)
          }}
          role="menuitemradio"
          aria-checked={locale.value === actuallySelectedLocale}
        >
          {locale.value === requestedLocale && <LoadingSpinner size="small" />}
          {locale.value === actuallySelectedLocale && (
            <Icon name="check" className="menu-item-icon" />
          )}
          {/* &#x200E; prevents trailing parentheses from going in the wrong
              place in rtl languages */}
          <span>{locale.label}&#x200E;</span>
          <span className="menu-item-subtext">
            <FormattedMessage id={locale.key} defaultMessage={locale.name} />
          </span>
        </MenuItem>
      )
    })
  }

  return <Menu {...props}>{renderLocaleOptions()}</Menu>
}

export default LocaleMenu
