import React, { useEffect, useRef, useState } from 'react'

import { Icon } from '~/src/ui/Icon.js'
import { Tooltip } from '~/src/ui/Tooltip.js'

import './GallerySearch.css'

export function GallerySearch() {
  const [input, setInput] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInput(event.target.value)
  }

  function handleClear() {
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <label className="gallery-search-box">
      <Icon name="search" size="18" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Find in streets"
        value={input}
        onChange={handleChange}
      />
      <div className="gallery-search-clear">
        {input && (
          <Tooltip label="Clear">
            <button onClick={handleClear}>
              <Icon name="close" size="14" />
            </button>
          </Tooltip>
        )}
      </div>
    </label>
  )
}
