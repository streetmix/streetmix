/**
 * Refocusing on the body immediately after some other element is
 * removed from the page allows the application to continue to receive
 * keydown events. (Otherwise the browser could capture those events
 * and do browser default actions instead.)
 * However, loseAnyFocus() is very aggressive, because if it is called at
 * the wrong time, it could cause the user to lose focus on something
 * (like an input box) improperly, so be very careful when using it.
 */
export function loseAnyFocus () {
  document.body.focus()
}

export function isFocusOnBody () {
  return document.activeElement === document.body
}
