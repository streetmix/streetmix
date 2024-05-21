import React from 'react'
import { ExternalLinkIcon } from '@radix-ui/react-icons'

import ExternalLink from '~/src/ui/ExternalLink'

function ExportStreetmeter (): React.ReactElement {
  return (
    <ExternalLink href={`https://streetmeter.net/#${window.location.href}`}>
      Open in Streetmeter
      <span
        style={{
          backgroundColor: '#ffd755',
          color: '#554100',
          borderRadius: '4px',
          marginLeft: '.5em',
          padding: '.25em .5em',
          fontSize: '.85em',
          fontWeight: '550'
        }}
      >
        BETA
      </span>
      <ExternalLinkIcon className="menu-item-external-link" />
    </ExternalLink>
  )
}

export default ExportStreetmeter
