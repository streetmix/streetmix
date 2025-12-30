import { useState, useEffect, useCallback, useRef } from 'react'
import { useIntl } from 'react-intl'

import { useSelector, useDispatch } from '../store/hooks.js'
import { saveStreetName } from '../store/slices/street.js'
import { StreetMeta } from './StreetMeta/index.js'
import StreetName from './StreetName.js'

import type { MenuCoords } from '../menubar/MenuBar.js'

import './StreetNameplateContainer.css'

interface StreetNameCoords {
  left: number
  width: number
}

function StreetNameplateContainer() {
  const isVisible = useSelector((state) => !state.ui.welcomePanelVisible)
  const isEditable = useSelector(
    (state) => !state.app.readOnly && state.flags.EDIT_STREET_NAME.value
  )
  const streetName = useSelector((state) => state.street.name)
  const dispatch = useDispatch()
  const intl = useIntl()
  const streetNameEl = useRef<HTMLDivElement>(null)
  const lastSentCoords = useRef<StreetNameCoords>(null)
  const [menuCoords, setMenuCoords] = useState<MenuCoords>({})
  const [streetNameCoords, setStreetNameCoords] = useState<StreetNameCoords>({
    left: 0,
    width: 0,
  })

  const updateCoords = useCallback(() => {
    if (streetNameEl.current === null) return
    const rect = streetNameEl.current.getBoundingClientRect()
    const coords = {
      left: rect.left,
      width: rect.width,
    }

    if (
      !lastSentCoords.current ||
      coords.left !== lastSentCoords.current.left ||
      coords.width !== lastSentCoords.current.width
    ) {
      lastSentCoords.current = coords
      handleResizeStreetName(coords)
    }
  }, [])

  const updatePositions = useCallback((event: CustomEvent<MenuCoords>) => {
    if (event.detail !== undefined) {
      setMenuCoords(event.detail)
    }
  }, [])

  // Add listeners on mount
  useEffect(() => {
    window.addEventListener('resize', updateCoords)
    window.addEventListener(
      'stmx:menu_bar_resized',
      updatePositions as EventListener
    )
    window.dispatchEvent(new CustomEvent('stmx:streetnameplate_mounted'))

    return () => {
      window.removeEventListener('resize', updateCoords)
      window.removeEventListener(
        'stmx:menu_bar_resized',
        updatePositions as EventListener
      )
    }
  }, [updateCoords, updatePositions])

  // Only update coords when something affects the size of the nameplate,
  // prevents excessive cascading renders
  useEffect(() => {
    updateCoords()
  }, [streetName, updateCoords])

  function handleResizeStreetName(coords: StreetNameCoords): void {
    setStreetNameCoords({
      left: coords.left,
      width: coords.width,
    })
  }

  function determineClassNames(): string {
    const classNames = ['street-nameplate-container']
    const { leftMenuBarRightPos, rightMenuBarLeftPos } = menuCoords

    // If we have menu position values, and the street nameplate might overlap
    // either side, apply a class name that pushes it down visually.
    if (
      leftMenuBarRightPos !== undefined &&
      rightMenuBarLeftPos !== undefined &&
      (streetNameCoords.left < leftMenuBarRightPos ||
        streetNameCoords.left + streetNameCoords.width > rightMenuBarLeftPos)
    ) {
      classNames.push('move-down-for-menu')
    }

    // <StreetNameplateContainer /> might stick out from underneath the
    // <WelcomePanel /> when it's visible. We've checked the store to see if
    // the panel is visible, and if so, this component is not. In this case,
    // momentarily keep the UI clean by hiding it until the panel goes away.
    if (!isVisible) {
      classNames.push('hidden')
    }

    return classNames.join(' ')
  }

  function handleClickStreetName(): void {
    if (!isEditable) return

    const newName = window.prompt(
      intl.formatMessage({
        id: 'prompt.new-street',
        defaultMessage: 'New street name:',
      }),
      typeof streetName === 'string'
        ? streetName
        : intl.formatMessage({
            id: 'street.default-name',
            defaultMessage: 'Unnamed St',
          })
    )

    // If window.prompt returns `null`, the interaction is canceled.
    if (newName === null) {
      return
    }

    dispatch(saveStreetName(newName, true))
  }

  return (
    <div className={determineClassNames()}>
      <StreetName
        editable={isEditable}
        ref={streetNameEl}
        name={streetName}
        onClick={handleClickStreetName}
      />
      <StreetMeta />
    </div>
  )
}

export default StreetNameplateContainer
