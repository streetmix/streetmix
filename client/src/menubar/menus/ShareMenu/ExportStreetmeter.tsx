import React from 'react'

import ExternalLink from '~/src/ui/ExternalLink'

function ExportStreetmeter (): React.ReactElement {
  return (
    <ExternalLink
      href={`https://streetmeter.net/#${window.location.href}`}
      icon={true}
    >
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
    </ExternalLink>
  )
}

export default ExportStreetmeter
