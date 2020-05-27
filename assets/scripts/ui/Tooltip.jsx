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

const TOOLTIP_DEFAULT_PLACEMENT = 'top'
const TOOLTIP_OFFSET = [0, 10]
const TOOLTIP_DURATION = 100
const TOOLTIP_ANIMATION = 'shift-toward'
const TOOLTIP_DELAY = [150, 0]

Tooltip.propTypes = {
  placement: PropTypes.string,
  source: PropTypes.object,
  target: PropTypes.object,
  label: PropTypes.string,
  sublabel: PropTypes.string,
  children: PropTypes.any
}

function Tooltip ({
  placement = TOOLTIP_DEFAULT_PLACEMENT,
  source,
  target,
  label,
  sublabel,
  children,
  ...props
}) {
  const renderContent = (label, sublabel) => (
    <>
      {label}
      {sublabel && <p>{sublabel}</p>}
    </>
  )

  // Our implementation of TippyJS is predominantly used in cases where there
  // may be multiple reference elements. A "singleton" tooltip is used because
  // we need it to animate in when it appears for the first time, and animate
  // out when it leaves, but not when hovering or focusing across reference
  // elements. For more on singleton tooltips, refer to Tippy documentation:
  //
  // https://atomiks.github.io/tippyjs/#singleton
  //
  // For React components, the Tippy singleton is defined with the
  // useSingleton() hook.
  // https://github.com/atomiks/tippyjs-react#-usesingleton
  //
  // The <Tippy /> component is overloaded so that when used in a singleton
  // it functions as both the "source" (a generic tooltip instance) and
  // the "target" (a wrapper around a reference element to give it a tooltip).
  // While this may be confusing, we do not abstract over this behavior here.
  //
  // If the `source` prop is provided (this is defined by using a
  // useSingleton() hook in the parent component) we return a <Tippy />
  // instance that defines a generic tooltip with our desired behavior.
  // We define our standard behavior but these can be overwritten with
  // any of Tippy's props.
  // https://github.com/atomiks/tippyjs-react#-props
  if (source) {
    return (
      <Tippy
        placement={placement}
        offset={TOOLTIP_OFFSET}
        duration={TOOLTIP_DURATION}
        animation={TOOLTIP_ANIMATION}
        delay={TOOLTIP_DELAY}
        singleton={source}
        {...props}
      />
    )
  }

  // If a `target` prop is provided (this is also defined by the useSingleton()
  // hook) we return a <Tippy /> higher-order component (HOC) that wraps the
  // reference element where a tooltip should be displayed. When <Tippy />
  // is used in this way, it doesn't take the same tooltip behavior props.
  if (target) {
    return (
      <Tippy content={renderContent(label, sublabel)} singleton={target}>
        {children}
      </Tippy>
    )
  }

  // If neither `source` nor `target` are provided, then we assume that the
  // tooltip is a one-off (that is, not a singleton that should be reused
  // across multiple reference elements). We set this up with our standard
  // default behavior but these can be overridden with any of Tippy's props.
  return (
    <Tippy
      content={renderContent(label, sublabel)}
      placement={placement}
      offset={TOOLTIP_OFFSET}
      duration={TOOLTIP_DURATION}
      animation={TOOLTIP_ANIMATION}
      delay={TOOLTIP_DELAY}
      {...props}
    >
      {children}
    </Tippy>
  )
}

export default Tooltip
export { useSingleton }
