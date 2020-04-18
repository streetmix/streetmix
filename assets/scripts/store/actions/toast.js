import { ADD_TOAST, DISMISS_TOAST, DESTROY_TOAST } from './'

export function addToast ({
  method,
  component,
  title,
  message,
  action,
  duration
}) {
  return {
    type: ADD_TOAST,
    method,
    component,
    title,
    message,
    action,
    duration
  }
}

export function dismissToast (id) {
  return {
    type: DISMISS_TOAST,
    id
  }
}

export function destroyToast (id) {
  return {
    type: DESTROY_TOAST,
    id
  }
}
