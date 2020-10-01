import React from 'react'
import PropTypes from 'prop-types'
import ExternalLink from '../../ui/ExternalLink'
import './TeamMember.scss'

function TeamMember (props) {
  const { name, title, mugshotFile, url } = props
  const style = {}

  if (mugshotFile) {
    style.backgroundImage = `url('/images/team/${mugshotFile}')`
  }

  const displayName = url ? (
    <ExternalLink href={url}>{name}</ExternalLink>
  ) : (
    name
  )

  return (
    <div className="team-member">
      <div className="team-member-mugshot" style={style} />
      <span className="team-member-name">{displayName}</span>
      <span className="team-member-title">{title}</span>
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
