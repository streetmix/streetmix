import React from 'react'
import { useIntl } from 'react-intl'

import Icon from '~/src/ui/Icon.js'
import { Tooltip } from '~/src/ui/Tooltip.js'
import './EditableLabel.css'

import type { SectionType } from '@streetmix/types'

interface EditableLabelProps {
  readonly label: string | React.JSX.Element
  readonly type: SectionType
  readonly isEditUnlocked: boolean
  readonly handleClickEdit: React.MouseEventHandler
}

export function EditableLabel({
  label,
  type,
  handleClickEdit,
  isEditUnlocked,
}: EditableLabelProps) {
  const intl = useIntl()

  // Boundary labels are not currently editable, so labels are not interactive
  if (type === 'boundary') {
    return <h3 className="popup-label">{label}</h3>
  }

  if (isEditUnlocked) {
    return (
      <h3
        className="popup-label popup-label-editable"
        onClick={handleClickEdit}
      >
        {label}
        <Icon name="edit" className="popup-label-editable-icon" />
      </h3>
    )
  }

  return (
    <Tooltip
      label={intl.formatMessage({
        id: 'plus.locked.sub-edit',
        defaultMessage: 'Upgrade to Streetmix+ to edit',
      })}
    >
      <h3 className="popup-label popup-label-editable">
        {label}
        <Icon name="lock" className="popup-label-editable-icon" />
      </h3>
    </Tooltip>
  )
}
