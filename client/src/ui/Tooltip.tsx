/**
 * This component is a wrapper around tippyjs/react to provide
 * functionality common to Streetmix's implementation of it
 */
import React from 'react'
import Tippy, { useSingleton } from '@tippyjs/react'

import type { TippyProps } from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/shift-toward.css'
import './Tooltip.css'

const TOOLTIP_DEFAULT_PLACEMENT: TippyProps['placement'] = 'top'
const TOOLTIP_OFFSET: TippyProps['offset'] = [0, 10]
const TOOLTIP_DURATION: TippyProps['duration'] = 100
const TOOLTIP_ANIMATION: TippyProps['animation'] = 'shift-toward'
const TOOLTIP_DELAY: TippyProps['delay'] = [150, 0]

interface TooltipProps extends TippyProps {
  source?: TippyProps['singleton']
  target?: TippyProps['singleton']
  label?: string
  sublabel?: string
}

function Tooltip ({
  source,
  target,
  label,
  sublabel,
  placement = TOOLTIP_DEFAULT_PLACEMENT,
  children,
  ...props
}: TooltipProps): React.ReactElement {
  const renderContent = (label = '', sublabel = ''): React.ReactElement => (
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
  if (typeof source !== 'undefined') {
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
  if (typeof target !== 'undefined') {
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
