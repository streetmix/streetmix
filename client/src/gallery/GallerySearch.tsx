import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'

import { Icon } from '~/src/ui/Icon.js'
import { Tooltip } from '~/src/ui/Tooltip.js'

import './GallerySearch.css'

export function GallerySearch() {
  const [input, setInput] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const intl = useIntl()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      // Stubbed until search API is implemented.
      console.log('Gallery search query:', input)
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [input])

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInput(event.target.value)
  }

  function handleClear() {
    setInput('')
    inputRef.current?.focus()
  }

  const findLabel = intl.formatMessage({
    id: 'gallery.search.label',
    defaultMessage: 'Find in streets',
  })
  const clearLabel = intl.formatMessage({
    id: 'gallery.search.clear',
    defaultMessage: 'Clear',
  })

  return (
    <label className="gallery-search-box">
      <Icon name="search" size="18" aria-hidden="true" />
      <input
        ref={inputRef}
        type="text"
        aria-label={findLabel}
        placeholder={findLabel}
        value={input}
        onChange={handleChange}
      />
      <div className="gallery-search-clear">
        {input && (
          <Tooltip label={clearLabel}>
            <button type="button" aria-label={clearLabel} onClick={handleClear}>
              <Icon name="close" size="14" />
            </button>
          </Tooltip>
        )}
      </div>
    </label>
  )
}
