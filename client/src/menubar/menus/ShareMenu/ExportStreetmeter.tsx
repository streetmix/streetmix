import React from 'react'

import MenuItem from '../MenuItem'

function ExportStreetmeter (): React.ReactElement {
  return (
    <MenuItem href={`https://streetmeter.net/#${window.location.href}`}>
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
