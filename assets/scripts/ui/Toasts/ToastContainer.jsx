import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTransition, animated } from 'react-spring'
import Toast from './Toast'
import ToastUndo from './ToastUndo'
import ToastSignIn from './ToastSignIn'
import ToastNoConnection from './ToastNoConnection'
import { destroyToast } from '../../store/actions/toast'
import './ToastContainer.scss'

const TOAST_SPRING_CONFIG = {
  tension: 488,
  friction: 36,
  precision: 0.01
}
const TOAST_DISPLAY_TIMEOUT = 6000
const TOAST_MAX_TO_DISPLAY = 5

/**
 * Based on react-spring "Notification hub" example.
 * https://codesandbox.io/embed/7mqy09jyq
 */
function ToastContainer (props) {
  const config = TOAST_SPRING_CONFIG
  const [refMap] = useState(() => new WeakMap())
  const [cancelMap] = useState(() => new WeakMap())
  const toasts = useSelector((state) => state.toast.toasts)
  const contentDirection = useSelector((state) => state.app.contentDirection)
  const dispatch = useDispatch()

  // TODO: Truncation doesn't work
  const truncatedToasts =
    toasts.length >= TOAST_MAX_TO_DISPLAY
      ? toasts.slice(toasts.length - TOAST_MAX_TO_DISPLAY)
      : toasts

  const transitions = useTransition(truncatedToasts, (item) => item.timestamp, {
    from: {
      opacity: 0,
      height: 0,
      transform:
        contentDirection === 'rtl' ? 'translateX(-300px)' : 'translateX(300px)',
      marginTop: '10px',

      // `life` is just a variable name used by react-spring docs, it has no special meaning
      // This is the only property that decreases based on a duration (see config)
      life: '100%'
    },
    enter: (item) => async (next) => {
      // Get the computed width and height values from the DOM element as
      // it's first rendered, but before animating in, and then set these
      // values on the element to lock them in place. This solves some
      // layout issues (see comments below). Using `getBoundingClientRect()`
      // gets more precise values (e.g. decimal values).
      await next({
        // Set the width on the toast element so that the drop shadow
        // also has the proper width. `getBoundingClientRect()` is preferred
        // over `offsetWidth` because if the latter property returns a
        // rounded-down number (the nearest integer), setting a rounded
        // width can improperly cause text to wrap. So instead we obtain
        // the more precise measurement and force it to round up.
        width: Math.ceil(refMap.get(item).getBoundingClientRect().width),

        // Set the height on the toast element so that we can position
        // multiple toasts at the correct vertical spacing from each other.
        // This height also allows us to properly animate out as toasts
        // disappear, causing toasts below it to "slide" upwards.
        // `getBoundingClientRect()` is preferred over `offsetHeight` because
        // a rounded number can cause toats to be positioned too closely to
        // each other -- almost overlapping each other.
        height: Math.ceil(refMap.get(item).getBoundingClientRect().height)
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
        transform:
          contentDirection === 'rtl'
            ? 'translateX(-300px)'
            : 'translateX(300px)'
      })
      // Height going to zero allows subsequent messages to "slide" upwards
      // We also need to animate the margin between toasts
      await next({
        height: 0,
        marginTop: '0px'
      })
    },
    onRest: (item) => {
      // This actually destroys the toast in Redux once it's animated *in*. This
      // is counter-intuitive, but seems necessary, otherwise on subsequent updates
      // it's still in the state and can cause the toast to be rendered again
      dispatch(destroyToast(item.timestamp))
    },
    // When state is leave, this returns an array of three configs.
    // Each item in the array applies to each of the `next` calls in the `leave` function, I think.
    // So the first config sets the duration for the `life` property.
    config: (item, state) =>
      state === 'leave'
        ? [{ duration: item.duration ?? TOAST_DISPLAY_TIMEOUT }, config, config]
        : config
  })

  return (
    <div className="toast-container">
      {transitions.map((message) => {
        const {
          item,
          props: { life, ...style }
        } = message
        const setRef = (ref) => ref && refMap.set(item, ref)
        const handleClose = (event) => {
          event.stopPropagation()
          cancelMap.has(item) && cancelMap.get(item)()
        }

        let childComponent

        switch (message.item.component) {
          case 'TOAST_UNDO':
            childComponent = (
              <ToastUndo
                setRef={setRef}
                handleClose={handleClose}
                {...message}
              />
            )
            break
          case 'TOAST_SIGN_IN':
            childComponent = (
              <ToastSignIn
                setRef={setRef}
                handleClose={handleClose}
                {...message}
              />
            )
            break
          case 'TOAST_NO_CONNECTION':
            childComponent = (
              <ToastNoConnection
                setRef={setRef}
                handleClose={handleClose}
                {...message}
              />
            )
            break
          default:
            childComponent = (
              <Toast setRef={setRef} handleClose={handleClose} {...message} />
            )
            break
        }

        return (
          <animated.div key={item.timestamp} style={style}>
            {childComponent}
          </animated.div>
        )
      })}
    </div>
  )
}

export default ToastContainer
