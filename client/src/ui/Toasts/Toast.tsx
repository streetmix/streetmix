import { CloseButton } from '../CloseButton.js'
import './Toast.css'

import { type ToastItem } from '../../types'

export interface ToastProps {
  item: ToastItem
  setRef: <T>(ref: T | null) => void
  handleClose: React.MouseEventHandler
  handleAction?: React.MouseEventHandler
  className?: string
  children?: React.ReactNode
}

function Toast(props: ToastProps) {
  const {
    item,
    setRef,
    handleClose,
    handleAction = () => {},
    className,
    children,
  } = props
  const { method, title, action } = item

  const classNames = ['toast']
  if (method !== undefined) {
    classNames.push('toast-' + method)
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
          {children ??
            ('message' in item && (
              <p className="toast-message">{item.message}</p>
            ))}
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
