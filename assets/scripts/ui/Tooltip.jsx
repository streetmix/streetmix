/**
 * This component is a wrapper around tippyjs/react to provide
 * functionality common to Streetmix's implementation of it
 */
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
  placement = 'top',
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
        delay={[150, 0]}
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

  // If something happens and above conditions can't render, just
  // return any child nodes
  return children
}

export default Tooltip
export { useSingleton }
