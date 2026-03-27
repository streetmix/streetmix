import { Icon } from '~/src/ui/Icon.js'
import { Tooltip } from '~/src/ui/Tooltip.js'
import { images } from '~/src/app/load_resources.js'
import './SkyOptionItem.css'

interface SkyOptionItemProps {
  label: string
  iconImage?: string
  iconStyle?: React.CSSProperties
  isSelected: boolean
  isUnlocked: boolean
  onClick: React.MouseEventHandler
}

export function SkyOptionItem({
  label,
  iconImage,
  iconStyle,
  isSelected = false,
  isUnlocked = false,
  onClick = () => {},
}: SkyOptionItemProps) {
  const classNames = ['sky-option-item']

  if (isSelected) {
    classNames.push('sky-option-selected')
  }

  const isDisabled = !isUnlocked && !isSelected

  function handleClick(event: React.MouseEvent) {
    onClick(event)
  }

  return (
    <Tooltip label={label} placement="bottom">
      <button
        aria-label={label}
        className={classNames.join(' ')}
        style={iconStyle}
        onClick={handleClick}
        disabled={isDisabled}
      >
        {isDisabled && (
          <>
            <div className="sky-option-disabled-overlay" />
            <Icon name="lock" />
          </>
        )}
        {iconImage !== undefined && (
          <img
            src={images.get(iconImage)?.src}
            className="sky-option-icon"
            alt=""
            draggable={false}
          />
        )}
      </button>
    </Tooltip>
  )
}
