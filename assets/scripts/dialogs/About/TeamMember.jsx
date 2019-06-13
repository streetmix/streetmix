import React from 'react'
import PropTypes from 'prop-types'

function TeamMember (props) {
  const { name, title, mugshotFile, url } = props
  const style = {}

  if (mugshotFile) {
    style.backgroundImage = `url('/images/team/${mugshotFile}')`
  }

  const displayName = (url) ? (
    <a target="_blank" rel="noopener noreferrer" href={url}>{name}</a>
  ) : name

  return (
    <div className="about-dialog-team-member">
      <div className="about-dialog-team-mugshot" style={style} />
      <span className="about-team-name">{displayName}</span>
      <span className="about-team-title">{title}</span>
    </div>
  )
}

TeamMember.propTypes = {
  name: PropTypes.string,
  title: PropTypes.string,
  mugshotFile: PropTypes.string,
  url: PropTypes.string
}

export default TeamMember
