import { useSelector } from '~/src/store/hooks.js'
import { editSliceLabel, getLabel } from '~/src/segments/labels.js'
import { EditableLabel } from './EditableLabel.js'
import { RemoveButton } from './RemoveButton.js'
import './PopupHeader.css'

import type { SectionElementTypeAndPosition } from '@streetmix/types'

export function PopupHeader(props: SectionElementTypeAndPosition) {
  const { type, position } = props
  const street = useSelector((state) => state.street)
  const isSubscriber = useSelector((state) => state.user.isSubscriber)

  const label = getLabel(street, type, position)

  const handleClickEdit = () => {
    if (type === 'slice') {
      const slice = street.segments[position]
      editSliceLabel(position, slice)
    }
  }

  return (
    <header>
      <EditableLabel
        label={label}
        type={type}
        handleClickEdit={handleClickEdit}
        isEditUnlocked={isSubscriber}
      />
      {type === 'slice' && <RemoveButton slice={position} />}
    </header>
  )
}
