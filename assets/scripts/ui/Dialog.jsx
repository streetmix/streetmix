import React from 'react'
import PropTypes from 'prop-types'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import CloseButton from './CloseButton'
import './Dialog.scss'

export const DialogRoot = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export const DialogTitle = ({ children, ...props }) => {
  return (
    <DialogPrimitive.Title asChild={true} {...props}>
      <header>
        <h1>{children}</h1>
      </header>
    </DialogPrimitive.Title>
  )
}
DialogTitle.propTypes = {
  children: PropTypes.node
}

export const DialogContent = React.forwardRef(
  (
    { title = '', description, className, children, ...props },
    forwardedRef
  ) => {
    const classNames = ['dialog-content']
    if (className) {
      classNames.push(className)
    }

    // TODO: Appearance animation
    return (
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay">
          <DialogPrimitive.Content
            className={classNames.join(' ')}
            {...props}
            ref={forwardedRef}
          >
            <DialogPrimitive.Close asChild={true}>
              <CloseButton />
            </DialogPrimitive.Close>
            {title && <DialogTitle>{title}</DialogTitle>}
            {children}
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    )
  }
)

DialogContent.displayName = 'DialogContent'
DialogContent.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node
}



/**
 * eperimental: a Dialog conmpoent that does all the things, similar to before...
 * maybe helps with transitionsetc
 * can also help with unit tests -- how to trigger individual dialog test mount?
 * @param param0 
 * @returns 
 */
 function Dialog ({ children }) {
  // Appear state controls transition in/out
  const [appear, setAppear] = useState(true)
  const [open, setOpen] = useState(true)
  const dispatch = useDispatch()

  // On "close", we animate the dialog out
  function handleClose () {
    setAppear(false)
  }

  // When the animation is complete, then we clear dialog state
  function handleExit () {
    dispatch(clearDialogs())
  }

  return (
    <CSSTransition
      appear={true}
      in={appear}
      timeout={80}
      classNames="legacy-dialog-transition"
      onExited={handleExit}
    >
      <DialogRoot open={open} onOpenChange={setOpen}>
        {/* children(handleClose) */}
        {children}
      </DialogRoot>
    </CSSTransition>
  )
}

Dialog.propTypes = {
  children: PropTypes.func.isRequired
}

export default Dialog

