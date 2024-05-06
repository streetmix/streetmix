import React from 'react'
import { FormattedMessage } from 'react-intl'
import { DownloadIcon } from '@radix-ui/react-icons'

import { useDispatch } from '~/src/store/hooks'
import { showDialog } from '~/src/store/slices/dialogs'

function SaveImage (): React.ReactElement {
  const dispatch = useDispatch()

  function handleClickSaveAsImage (event: React.MouseEvent): void {
    event.preventDefault()
    dispatch(showDialog('SAVE_AS_IMAGE'))
  }

  return (
    <a id="save-as-image" onClick={handleClickSaveAsImage}>
      <DownloadIcon className="menu-item-icon-radix" />
      <FormattedMessage id="menu.share.save" defaultMessage="Save as image…" />
      <span className="menu-item-subtext">
        <FormattedMessage
          id="menu.share.save-byline"
          defaultMessage="For including in a report, blog, etc."
        />
      </span>
    </a>
  )
}

export default SaveImage
