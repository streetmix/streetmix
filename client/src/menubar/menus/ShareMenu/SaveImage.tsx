import { FormattedMessage } from 'react-intl'

import { useDispatch } from '~/src/store/hooks.js'
import { showDialog } from '~/src/store/slices/dialogs.js'
import Icon from '~/src/ui/Icon.js'
import { MenuItem } from '../MenuItem.js'

export function SaveImage() {
  const dispatch = useDispatch()

  function handleClickSaveAsImage(event: React.MouseEvent): void {
    event.preventDefault()
    dispatch(showDialog('SAVE_AS_IMAGE'))
  }

  return (
    <MenuItem onClick={handleClickSaveAsImage}>
      <Icon name="download" className="menu-item-icon" />
      <FormattedMessage id="menu.share.save" defaultMessage="Save as image…" />
      <span className="menu-item-subtext">
        <FormattedMessage
          id="menu.share.save-byline"
          defaultMessage="For including in a report, blog, etc."
        />
      </span>
    </MenuItem>
  )
}
