import { ExternalLink } from '~/src/ui/ExternalLink.js'
import './TeamMember.css'

interface TeamMemberProps {
  name: string
  title: string
  mugshotFile: string
  url?: string
}

export function TeamMember(props: TeamMemberProps) {
  const { name, title, mugshotFile, url } = props
  const style: React.CSSProperties = {}

  if (mugshotFile) {
    style.backgroundImage = `url('/images/team/${mugshotFile}')`
  }

  const displayName =
    url !== undefined ? <ExternalLink href={url}>{name}</ExternalLink> : name

  return (
    <div className="team-member">
      <div className="team-member-mugshot" style={style} />
      <span className="team-member-name">{displayName}</span>
      <span className="team-member-title">{title}</span>
    </div>
  )
}
