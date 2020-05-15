import React from 'react'
import PropTypes from 'prop-types'
import Tippy, { useSingleton } from '@tippyjs/react/headless'
import './Tooltip.scss'

Tooltip.propTypes = {
  placement: PropTypes.string,
  source: PropTypes.object,
  target: PropTypes.object,
  label: PropTypes.string,
  sublabel: PropTypes.string,
  children: PropTypes.any
}

function Tooltip ({
  placement,
  source,
  target,
  label,
  sublabel,
  children,
  ...props
}) {
  if (source) {
    return (
      <Tippy
        placement={placement}
        offset={[0, 10]}
        moveTransition="transform 200ms cubic-bezier(0.22, 1, 0.36, 1)"
        singleton={source}
        render={(attrs, content) => (
          <div className="tooltip-popper" tabIndex="-1" {...attrs}>
            <div className="tooltip">
              <div className="tooltip-contents">{content}</div>
            </div>
            <div className="tooltip-pointer" data-popper-arrow="" />
          </div>
        )}
        {...props}
      />
    )
  }

  if (target) {
    return (
      <Tippy
        content={
          <>
            {label}
            {sublabel && <p>{sublabel}</p>}
          </>
        }
        singleton={target}
      >
        {children}
      </Tippy>
    )
  }
}

export default Tooltip
export { useSingleton }
