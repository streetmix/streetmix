import React from 'react'

import './MenuSeparator.css'

function MenuSeparator (): React.ReactElement {
  return (
    <div
      className="menu-separator"
      role="separator"
      aria-orientation="horizontal"
    />
  )
}

export default MenuSeparator
