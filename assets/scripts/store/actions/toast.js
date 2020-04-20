import { ADD_TOAST, DESTROY_TOAST } from './'

export function addToast ({
  mode,
  component,
  title,
  message,
  action,
  duration
}) {
  return {
    type: ADD_TOAST,
    mode,
    component,
    title,
    message,
    action,
    duration
  }
}

export function destroyToast (id) {
  return {
    type: DESTROY_TOAST,
    id
  }
}
