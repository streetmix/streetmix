import React from 'react'
import CloseButton from '../CloseButton'
import './Toast.scss'

export interface ToastItemProps {
  mode?: 'success' | 'warning'
  component?: string
  title?: string
  message?: string
  action?: string
}

export interface ToastProps {
  item: ToastItemProps
  setRef: () => void
  handleClose: (event?: React.MouseEvent | Event) => void
  handleAction: (event: React.MouseEvent) => void
  className?: string
  children?: React.ReactNode
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
  if (className !== undefined) {
    classNames.push(className)
  }

  return (
    <div className={classNames.join(' ')} ref={setRef}>
      <div className="toast-content">
        <CloseButton onClick={handleClose} />
        <div className="toast-body">
          {title !== undefined && <h3>{title}</h3>}
          {children !== undefined || <p className="toast-message">{message}</p>}
        </div>
        {action !== undefined && (
          <div className="toast-action">
            <button onClick={handleAction}>{action}</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Toast
