import React from 'react'
import CloseButton from '../CloseButton'
import './Toast.scss'

interface ToastProps {
  item: {
    mode: 'success' | 'warning'
    message: string
    title: string
    action: string
  }
  setRef: () => void
  handleClose: () => void
  handleAction: () => void
  className: string
  children: React.ReactNode
}

function Toast (props: ToastProps): React.ReactNode {
  const {
    item,
    setRef,
    handleClose,
    handleAction = () => {},
    className,
    children
  } = props
  const { mode, title, message, action } = item

  const classNames = ['toast']
  if (mode) {
    classNames.push('toast-' + mode)
  }
  if (className) {
    classNames.push(className)
  }

  return (
    <div className={classNames.join(' ')} ref={setRef}>
      <div className="toast-content">
        <CloseButton onClick={handleClose} />
        <div className="toast-body">
          {title && <h3>{title}</h3>}
          {children !== undefined || <p className="toast-message">{message}</p>}
        </div>
        {action && (
          <div className="toast-action">
            <button onClick={handleAction}>{action}</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Toast
