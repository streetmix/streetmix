import React, { useState } from 'react'
import { useTransition, animated } from '@react-spring/web'
import { useSelector, useDispatch } from '../../store/hooks'
import { destroyToast } from '../../store/slices/toasts'
import Toast from './Toast'
import ToastUndo from './ToastUndo'
import ToastSignIn from './ToastSignIn'
import ToastNoConnection from './ToastNoConnection'
import ToastWebMonetization from './ToastWebMonetization'
import ToastWebMonetizationSuccess from './ToastWebMonetizationSuccess'
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
 * https://codesandbox.io/s/v1i1t
 */
function ToastContainer (): React.ReactNode {
  const config = TOAST_SPRING_CONFIG
  const [refMap] = useState(() => new WeakMap())
  const [cancelMap] = useState(() => new WeakMap())
  const toasts = useSelector((state) => state.toasts)
  const contentDirection = useSelector((state) => state.app.contentDirection)
  const dispatch = useDispatch()

  const items =
    toasts.length >= TOAST_MAX_TO_DISPLAY
      ? toasts.slice(toasts.length - TOAST_MAX_TO_DISPLAY)
      : toasts

  const transitions = useTransition(items, {
    from: {
      opacity: 0,
      height: 0,
      x: contentDirection === 'rtl' ? -300 : 300,

      // `life` is just a variable name used by the react-spring example, it
      // has no special meaning. This is the only property that decreases
      // based on the `duration` property set in config
      life: '100%'
    },
    keys: (item) => item.timestamp,
    enter: (item) => async (next, cancel) => {
      cancelMap.set(item, cancel)

      await next({
        // Animate height to create space for the toast. Using
        // `getBoundingClientRect()` gets us more precise values (decimals)
        // and the +10 adds a margin between this and the next toast.
        height: refMap.get(item).getBoundingClientRect().height + 10
      })
      await next({
        opacity: 1,
        x: 0
      })
      await next({ life: '0%' })
    },
    leave: [
      // First animate transition out
      {
        opacity: 0,
        x: contentDirection === 'rtl' ? -300 : 300
      },
      {
        // Then animate height to zero so that subsequent messages "slide" upwards
        height: 0
      }
    ],
    onRest: (result, ctrl, item) => {
      dispatch(destroyToast(item.timestamp))
    },
    config: (item, index, phase) => (key) =>
      phase === 'enter' && key === 'life'
        ? { duration: item.duration ?? TOAST_DISPLAY_TIMEOUT }
        : config
  })

  return (
    <div className="toast-container">
      {transitions(({ life, ...style }, item) => {
        function setRef<T> (ref: T | null): void {
          ref !== null && refMap.set(item, ref)
        }

        function handleClose (event?: React.MouseEvent | Event): void {
          // Not all instances of this function is called by an event handler
          if (event !== undefined) {
            event.stopPropagation()
          }
          if (cancelMap.has(item) && life.get() !== '0%') {
            cancelMap.get(item)()
          }
        }

        let childComponent

        switch (item.component) {
          case 'TOAST_UNDO':
            childComponent = (
              <ToastUndo
                setRef={setRef}
                handleClose={handleClose}
                item={item}
              />
            )
            break
          case 'TOAST_SIGN_IN':
            childComponent = (
              <ToastSignIn
                setRef={setRef}
                handleClose={handleClose}
                item={item}
              />
            )
            break
          case 'TOAST_WEB_MONETIZATION':
            childComponent = (
              <ToastWebMonetization
                setRef={setRef}
                handleClose={handleClose}
                item={item}
              />
            )
            break
          case 'TOAST_WEB_MONETIZATION_SUCCESS':
            childComponent = (
              <ToastWebMonetizationSuccess
                setRef={setRef}
                handleClose={handleClose}
                item={item}
              />
            )
            break
          case 'TOAST_NO_CONNECTION':
            childComponent = (
              <ToastNoConnection
                setRef={setRef}
                handleClose={handleClose}
                item={item}
              />
            )
            break
          default:
            childComponent = (
              <Toast setRef={setRef} handleClose={handleClose} item={item} />
            )
            break
        }

        return (
          <animated.div style={style}>
            {childComponent}
            {/* lifebar debugger */}
            {/* <animated.div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '0px',
                right: life,
                width: 'auto',
                height: '5px',
                backgroundColor: 'blue'
              }}
            /> */}
          </animated.div>
        )
      })}
    </div>
  )
}

export default ToastContainer
