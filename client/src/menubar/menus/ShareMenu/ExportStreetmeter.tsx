import React from 'react'

import Icon from '~/src/ui/Icon'
import MenuItem from '../MenuItem'

function ExportStreetmeter (): React.ReactElement {
  return (
    <MenuItem href={`https://streetmeter.net/#${window.location.href}`}>
      <Icon name="graph" className="menu-item-icon" />
      Open in Streetmeter
      <span
        style={{
          backgroundColor: 'var(--color-citrine-300)',
          color: 'var(--color-copper-900)',
          borderRadius: 'var(--border-radius)',
          marginLeft: '.5em',
          padding: '.25em .5em',
          fontSize: '.85em',
          fontWeight: '550'
        }}
      >
        BETA
      </span>
    </MenuItem>
  )
}

export default ExportStreetmeter
