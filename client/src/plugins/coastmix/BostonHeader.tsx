import { useState } from 'react'

import bostonLogo from 'url:./images/boston-logo.png'
import chevronIcon from 'url:./images/boston-icon-chevron.svg'
import cityHallIcon from 'url:./images/boston-icon-city-hall.svg'
import lockIcon from 'url:./images/boston-icon-lock.svg'

import './BostonHeader.css'

export function BostonHeader() {
  const [showDropdown, setShowDropdown] = useState(false)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setShowDropdown(event.target.checked)
  }

  return (
    <div className="boston-site-banner-container">
      <input
        type="checkbox"
        id="boston-site-banner"
        className="boston-site-banner-checkbox"
        onChange={handleChange}
        checked={showDropdown}
      />
      <label htmlFor="boston-site-banner" className="boston-site-banner">
        <div>
          <img
            className="boston-site-banner-logo"
            src={bostonLogo}
            alt="Boston.gov"
            draggable={false}
          />
          <span className="boston-site-banner-text">
            An official website of the City of Boston.{' '}
            <span className="boston-site-banner-button">
              <span>Here's how you know</span>
              <img src={chevronIcon} draggable={false} />
            </span>
          </span>
        </div>
      </label>
      <div className="boston-site-banner-expansion">
        <div>
          <div className="boston-site-banner-expansion-item">
            <img
              src={cityHallIcon}
              className="boston-site-banner-city-hall"
              draggable={false}
            />
            <div className="boston-site-banner-expansion-item-content">
              <p>Official websites use .boston.gov</p>
              <p>
                A .boston.gov website belongs to an official government
                organization in the City of Boston.
              </p>
            </div>
          </div>
          <div className="boston-site-banner-expansion-item">
            <img
              src={lockIcon}
              className="boston-site-banner-lock"
              draggable={false}
            />
            <div className="boston-site-banner-expansion-item-content">
              <p>Secure .gov websites use HTTPS</p>
              <p>
                A lock{' '}
                <span aria-hidden="true">
                  (
                  <img
                    src={lockIcon}
                    className="boston-site-banner-mini-lock"
                    draggable={false}
                  />
                  )
                </span>{' '}
                or https:// means you've safely connected to the .gov website.
                Share sensitive information only on official, secure websites.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
