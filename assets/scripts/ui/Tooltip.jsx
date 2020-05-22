import React from 'react'
import PropTypes from 'prop-types'
import Tippy, { useSingleton } from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/shift-toward.css'
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
        duration={100}
        animation="shift-toward"
        delay={[200, 150]}
        moveTransition="transform 150ms cubic-bezier(0.22, 1, 0.36, 1)"
        singleton={source}
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
