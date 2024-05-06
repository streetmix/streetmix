import React from 'react'
import { FormattedMessage } from 'react-intl'
import { IoPrintOutline } from 'react-icons/io5'

import { useDispatch } from '~/src/store/hooks'
import { startPrinting } from '~/src/store/slices/app'

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
    <a onClick={handleClickPrint}>
      <IoPrintOutline className="menu-item-icon" />
      <FormattedMessage id="menu.share.print" defaultMessage="Print…" />
    </a>
  )
}

export default PrintImage
