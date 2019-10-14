import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useTransition, animated } from 'react-spring'
import Toast from './Toast'
import ToastUndo from './ToastUndo'
import ToastSignIn from './ToastSignIn'
import ToastNoConnection from './ToastNoConnection'
import './ToastContainer.scss'

let id = 0

const TOAST_SPRING_CONFIG = {
  tension: 488,
  friction: 36,
  precision: 0.01
}
const TOAST_DISPLAY_TIMEOUT = 12000

ToastContainer.propTypes = {
  config: PropTypes.object,
  timeout: PropTypes.number,
  setMessages: PropTypes.func
}

function ToastContainer (props) {
  const { config = TOAST_SPRING_CONFIG, timeout = TOAST_DISPLAY_TIMEOUT, setMessages } = props
  const [refMap] = useState(() => new WeakMap())
  const [cancelMap] = useState(() => new WeakMap())
  const [items, setItems] = useState([])

  const transitions = useTransition(items, item => item.key, {
    from: {
      opacity: 0,
      height: 0,
      transform: 'translateX(300px)',
      marginTop: '10px',

      // `life` is just a variable name used by react-spring docs, it has no special meaning
      // This is the only property that decreases based on a duration (see config)
      life: '100%'
    },
    enter: (item) => async (next) => {
      await next({
        // Set the width on enter so that the toast has proper width for shadow
        width: refMap.get(item).offsetWidth,

        // Height is set dynamically so we can animate out
        height: refMap.get(item).offsetHeight
      })
      await next({
        opacity: 1,
        transform: 'translateX(0px)'
      })
    },
    leave: (item) => async (next, cancel) => {
      cancelMap.set(item, cancel)
      await next({
        life: '0%'
      })
      await next({
        opacity: 0,
        transform: 'translateX(300px)'
      })
      // Height going to zero allows subsequent messages to "slide" upwards
      // We also need to animate the margin between toasts
      await next({
        height: 0,
        marginTop: '0px'
      })
    },
    onRest: (item) => setItems(state => state.filter(i => i.key !== item.key)),
    // When state is leave, this returns an array of three configs.
    // Each item in the array applies to each of the `next` calls in the `leave` function, I think.
    // So the first config sets the duration for the `life` property.
    config: (item, state) => (state === 'leave' ? [{ duration: timeout }, config, config] : config)
  })

  useEffect(() => void setMessages(item => setItems(state => [...state, { key: id++, ...item }])), [setMessages])

  return (
    <div className="toast-container">
      {transitions.map((message) => {
        const { item, props: { life, ...style } } = message
        const setRef = ref => ref && refMap.set(item, ref)
        const handleClose = (event) => {
          event.stopPropagation()
          cancelMap.has(item) && cancelMap.get(item)()
        }

        let childComponent

        switch (message.item.component) {
          case 'TOAST_UNDO':
            childComponent = <ToastUndo setRef={setRef} handleClose={handleClose} {...message} />
            break
          case 'TOAST_SIGN_IN':
            childComponent = <ToastSignIn setRef={setRef} handleClose={handleClose} {...message} />
            break
          case 'TOAST_NO_CONNECTION':
            childComponent = <ToastNoConnection setRef={setRef} handleClose={handleClose} {...message} />
            break
          default:
            childComponent = <Toast setRef={setRef} handleClose={handleClose} {...message} />
            break
        }

        return (
          <animated.div key={item.key} style={style}>
            {childComponent}
          </animated.div>
        )
      })}
    </div>
  )
}

export default ToastContainer
