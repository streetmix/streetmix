import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { changeLocale } from '../store/slices/locale'
import { clearMenus } from '../store/slices/menus'
import LocaleSelect from './LocaleSelect'
import Menu from './Menu'

function SettingsMenu (props) {
  const locale = useSelector((state) => state.locale.locale)
  const requestedLocale = useSelector((state) => state.locale.requestedLocale)
  const dispatch = useDispatch()

  async function selectLocale (newLocale) {
    if (locale === newLocale) return

    await dispatch(changeLocale(newLocale))

    // Hide the menu after a locale is selected.
    // Note: because the application's tree is actually remounted with new
    // locale context, the menu doesn't animate away. It just disappears.
    // We still have to dispatch the clearMenus() so that the Redux store
    // knows that the menu has closed.
    dispatch(clearMenus())
  }

  return (
    <Menu {...props}>
      <LocaleSelect
        locale={locale}
        requestedLocale={requestedLocale}
        selectLocale={selectLocale}
      />
    </Menu>
  )
}

export default SettingsMenu
