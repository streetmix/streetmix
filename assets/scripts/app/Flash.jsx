import React, { useRef, useEffect } from 'react'
import './Flash.scss'

const FLASH_ON_DURATION = 100
const FLASH_TOTAL_DURATION = 1000
const FLASH_EVENT_NAME = 'stmx:live_update'

const Flash = (props) => {
  const el = useRef(null)

  let timer1 = -1
  let timer2 = -1

  function doFlash () {
    // Clear previous flash state, if any
    el.current.classList.remove('flash-fading-out')
    window.clearTimeout(timer1)
    window.clearTimeout(timer2)

    // Begin flash
    el.current.classList.add('flash-visible')

    // Fade out
    timer1 = window.setTimeout(() => {
      el.current.classList.add('flash-fading-out')
    }, FLASH_ON_DURATION)

    timer2 = window.setTimeout(() => {
      el.current.classList.remove('flash-visible')
      el.current.classList.remove('flash-fading-out')
    }, FLASH_TOTAL_DURATION)
  }

  useEffect(() => {
    window.addEventListener(FLASH_EVENT_NAME, doFlash)
    return () => {
      window.removeEventListener(FLASH_EVENT_NAME, doFlash)
    }
  })

  return (
    <div className="flash" ref={el} />
  )
}

export default Flash
