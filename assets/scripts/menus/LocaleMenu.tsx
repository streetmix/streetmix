import React from 'react'
import { FormattedMessage } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector, useDispatch } from '../store/hooks'
import { changeLocale } from '../store/slices/locale'
import { clearMenus } from '../store/slices/menus'
import { DEFAULT_LOCALE } from '../locales/constants'
import {
  getAvailableLocales,
  getActualLocaleFromRequested
} from '../locales/locale'
import LoadingSpinner from '../ui/LoadingSpinner'
import { ICON_CHECK } from '../ui/icons'
import Menu, { type MenuProps } from './Menu'

function LocaleMenu (props: MenuProps): React.ReactElement {
  const locale = useSelector((state) => state.locale.locale || DEFAULT_LOCALE)
  const requestedLocale = useSelector((state) => state.locale.requestedLocale)
  const dispatch = useDispatch()
  const filteredLocales = getAvailableLocales()
  const actuallySelectedLocale = getActualLocaleFromRequested(locale)

  async function selectLocale (newLocale: string): Promise<void> {
    if (locale === newLocale) return

    // Don't know how to fix, but this is valid.
    // eslint-disable-next-line @typescript-eslint/await-thenable
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
      const classNames = ['menu-item']

      if (locale.value === actuallySelectedLocale) {
        classNames.push('menu-item-selected')
      }

      // TODO: ARIA roles and attributes have been added to help with
      // testing, but these are not actually to accessible spec
      return (
        <li
          className={classNames.join(' ')}
          key={locale.value}
          onClick={() => {
            void selectLocale(locale.value)
          }}
          role="option"
          aria-selected={locale.value === actuallySelectedLocale}
        >
          {locale.value === requestedLocale && <LoadingSpinner size="small" />}
          {locale.value === actuallySelectedLocale && (
            <FontAwesomeIcon className="menu-item-icon" icon={ICON_CHECK} />
          )}
          {/* &#x200E; prevents trailing parentheses from going in the wrong
              place in rtl languages */}
          <span>{locale.label}&#x200E;</span>
          <span className="menu-item-subtext">
            <FormattedMessage id={locale.key} defaultMessage={locale.name} />
          </span>
        </li>
      )
    })
  }

  return (
    <Menu {...props}>
      <ul
        className="menu-item-group"
        role="listbox"
        aria-labelledby="settings-menu-language-select"
      >
        {renderLocaleOptions()}
      </ul>
    </Menu>
  )
}

export default LocaleMenu
