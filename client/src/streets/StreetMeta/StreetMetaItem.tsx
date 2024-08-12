import React, { forwardRef } from 'react'

import Tooltip from '../../ui/Tooltip'
import './StreetMetaItem.css'

import type { TippyProps } from '@tippyjs/react'

interface StreetMetaItemProps {
  className?: string
  isEditable?: boolean // Might need a better name; isInteractive?
  tooltip?: string
  sublabel?: string
  onClick?: (event: React.MouseEvent) => void
  icon?: React.ReactNode
  children: React.ReactNode

  // We needed to type this for some special logic, below
  'data-state'?: string
}

const StreetMetaItem = forwardRef(
  (
    {
      className = '',
      isEditable = false,
      tooltip,
      sublabel,
      onClick = () => {},
      icon,
      children,
      // extra props are spread on child <button>, if present
      // This is needed for Radix UI's dropdown menu implementation.
      ...restProps
    }: StreetMetaItemProps,
    // Forwards a ref to child <button>, if present
    ref: React.Ref<HTMLButtonElement>
  ) => {
    function handleClick (event: React.MouseEvent): void {
      event.preventDefault()
      onClick(event)
    }

    const classNames = ['street-meta-item']
    if (!isEditable) {
      classNames.push('street-meta-item-plain')
    }
    if (className) {
      classNames.push(className)
    }

    const content = (
      <>
        {icon !== undefined && <div className="street-meta-icon">{icon}</div>}
        <div className="street-meta-content">{children}</div>
      </>
    )

    // A workaround for when this is a child of Radix UI's dropdown menu
    // When the dropdown opens, always hide the tooltip.
    // Unfortunately once the tooltip becomes controlled via `visible`,
    // it apparently longer acts in an uncontrolled manner. (maybe we can fix
    // this by setting uncontrolled props back, but what are they?)
    const maybeTooltipProps: Partial<TippyProps> = {}
    // Only act if this prop exists
    if (restProps['data-state'] !== undefined) {
      if (restProps['data-state'] === 'open') {
        maybeTooltipProps.visible = false
      } else {
        delete maybeTooltipProps.visible
      }
    }

    if (isEditable) {
      return (
        <div className={classNames.join(' ')}>
          <Tooltip
            label={tooltip}
            sublabel={sublabel}
            placement="bottom"
            {...maybeTooltipProps}
          >
            <button
              onClick={handleClick}
              aria-label={tooltip}
              ref={ref}
              {...restProps}
            >
              {content}
            </button>
          </Tooltip>
        </div>
      )
    }

    return <div className={classNames.join(' ')}>{content}</div>
  }
)

StreetMetaItem.displayName = 'StreetMetaItem'

export default StreetMetaItem
