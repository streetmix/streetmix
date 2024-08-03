import React from 'react'

interface IconProps {
  name: string
  className?: string
}

function Icon ({ name, className = '' }: IconProps): React.ReactElement {
  return <svg className={className} data-icon={name} data-icon-source="test" />
}

export default Icon
