import React from 'react'
import { FormattedMessage } from 'react-intl'

import { useDispatch } from '~/src/store/hooks'
import { startPrinting } from '~/src/store/slices/app'
import Icon from '~/src/ui/Icon'
import MenuItem from '../MenuItem'

function PrintImage (): React.ReactElement {
  const dispatch = useDispatch()

  function handleClickPrint (event: React.MouseEvent): void {
    event.preventDefault()

    // Manually dispatch printing state here. Workaround for Chrome bug where
    // calling window.print() programatically (even with a timeout) render a
    // blank image instead
    dispatch(startPrinting())

    window.setTimeout(function () {
      window.print()
    }, 0)
  }

  return (
    <MenuItem onClick={handleClickPrint}>
      <Icon name="print" className="menu-item-icon" />
      <FormattedMessage id="menu.share.print" defaultMessage="Print…" />
    </MenuItem>
  )
}

export default PrintImage
