import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class Icon extends React.Component {
  static propTypes = {
    icon: PropTypes.string.isRequired
  }

  render () {
    switch (this.props.icon) {
      case 'twitter':
        return <FontAwesomeIcon icon={['fab', 'twitter']} />
      case 'facebook':
        return <FontAwesomeIcon icon={['fab', 'facebook-square']} />
      case 'github':
        return <FontAwesomeIcon icon={['fab', 'github']} />
      case 'slack':
        // TODO: Use Webpack SVG loader to import './icons/slack.svg' instead
        // This would make the original SVG easier to edit; plus Webpack takes
        // care of minification, etc.; we could also use the svg inside an <img>
        // tag which is easier to do things like alt-text, styling etc.
        // Currently we rewrite the SVG as React JSX and apply the className directly:
        return (
          <svg className="icon" width="100%" height="100%" viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 1.41421 }}>
            <g transform="matrix(0.325987,-4.71378e-19,-4.71378e-19,0.327912,-0.477246,-9.27782)">
              <path d="M13.997,105.78C8.503,105.822 3.849,102.548 2.133,97.438C2.067,97.24 2.01,97.048 1.955,96.855C0.085,90.311 3.711,83.465 10.21,81.273L114.45,46.35C115.717,45.987 116.993,45.802 118.257,45.794C123.897,45.75 128.679,49.096 130.437,54.314L130.593,54.818C132.543,61.634 127.698,67.718 121.893,69.668C121.889,69.671 120.833,70.028 18.231,105.059C16.844,105.53 15.421,105.768 13.997,105.78Z" style={{ fill: 'rgb(112,202,219)', fillRule: 'nonzero' }} />
              <path d="M31.372,157.045C25.835,157.085 21.165,153.857 19.469,148.82C19.405,148.628 19.344,148.435 19.289,148.241C17.393,141.619 21.015,134.701 27.536,132.506L131.78,97.263C133.127,96.813 134.518,96.583 135.917,96.57C141.469,96.528 146.347,99.92 148.068,105.014L148.228,105.544C149.235,109.065 148.64,113.022 146.638,116.145C145.146,118.467 140.44,120.511 140.44,120.511L35.8,156.29C34.342,156.777 32.855,157.034 31.372,157.047L31.372,157.045L31.372,157.045Z" style={{ fill: 'rgb(224,23,101)', fillRule: 'nonzero' }} />
              <path d="M118.148,157.268C112.588,157.311 107.665,153.803 105.893,148.545L71.103,45.205L70.929,44.625C69.044,38.035 72.669,31.161 79.166,28.971C80.466,28.534 81.81,28.306 83.163,28.294C85.173,28.279 87.118,28.732 88.95,29.637C92.013,31.162 94.304,33.787 95.399,37.029L130.186,140.36L130.287,140.692C132.241,147.534 128.624,154.412 122.127,156.602C120.84,157.031 119.5,157.256 118.148,157.268Z" style={{ fill: 'rgb(232,167,35)', fillRule: 'nonzero' }} />
              <path d="M66.435,174.674C60.875,174.717 55.948,171.209 54.175,165.944L19.394,62.608C19.334,62.418 19.274,62.228 19.216,62.033C17.336,55.445 20.95,48.57 27.445,46.378C28.74,45.948 30.079,45.721 31.43,45.71C36.991,45.666 41.915,49.173 43.687,54.433L78.469,157.773C78.534,157.953 78.593,158.152 78.646,158.342C80.53,164.935 76.914,171.814 70.409,174.006C69.117,174.437 67.78,174.662 66.431,174.673L66.435,174.673L66.435,174.674Z" style={{ fill: 'rgb(62,184,144)', fillRule: 'nonzero' }} />
              <path d="M100.997,133.996L125.255,125.702L117.325,102.152L93.039,110.359L100.997,133.996Z" style={{ fill: 'rgb(204,32,39)', fillRule: 'nonzero' }} />
              <path d="M49.364,151.65L73.62,143.357L65.63,119.627L41.35,127.837L49.364,151.65Z" style={{ fill: 'rgb(54,18,56)', fillRule: 'nonzero' }} />
              <path d="M83.727,82.7L107.987,74.417L100.15,51.142L75.845,59.285L83.727,82.7Z" style={{ fill: 'rgb(101,134,58)', fillRule: 'nonzero' }} />
              <path d="M32.088,100.33L56.348,92.047L48.415,68.475L24.11,76.617L32.088,100.33Z" style={{ fill: 'rgb(26,147,125)', fillRule: 'nonzero' }} />
            </g>
          </svg>
        )
      case 'forums':
        // TODO: Use Webpack SVG loader to import './icons/forums.svg' instead
        // See notes for 'slack', above.
        return (
          <svg className="icon" width="100%" height="100%" viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 1.41421 }}>
            <g transform="matrix(0.571429,0,0,0.571429,-4.57143,-4.57143)">
              <path d="M35.031,13C31.131,13 28,16.131 28,20.031L28,23L62.969,23C69.01,23 74,27.99 74,34.031L74,61.969C74,63.445 73.695,64.863 73.156,66.156L82,75L82,57L84.969,57C88.869,57 92,53.869 92,49.969L92,20.031C92,16.131 88.869,13 84.969,13L35.031,13Z" style={{ fill: 'rgb(220,220,220)' }} />
            </g>
            <g transform="matrix(0.571429,0,0,0.571429,-4.57143,-4.57143)">
              <path d="M15.031,27C11.131,27 8,30.131 8,34.031L8,61.969C8,65.869 11.131,69 15.031,69L18,69L18,87L36,69L62.969,69C66.869,69 70,65.869 70,61.969L70,34.031C70,30.131 66.869,27 62.969,27L15.031,27Z" style={{ fill: 'rgb(92,158,188)' }} />
            </g>
            <g transform="matrix(0.571429,0,0,0.571429,-4.57143,-4.57143)">
              <path d="M25,44C27.209,44 29,45.791 29,48C29,50.209 27.209,52 25,52C22.791,52 21,50.209 21,48C21,45.791 22.791,44 25,44Z" style={{ fill: 'white' }} />
            </g>
            <g transform="matrix(0.571429,0,0,0.571429,-4.57143,-4.57143)">
              <path d="M39,44C41.209,44 43,45.791 43,48C43,50.209 41.209,52 39,52C36.791,52 35,50.209 35,48C35,45.791 36.791,44 39,44Z" style={{ fill: 'white' }} />
            </g>
            <g transform="matrix(0.571429,0,0,0.571429,-4.57143,-4.57143)">
              <path d="M53,44C55.209,44 57,45.791 57,48C57,50.209 55.209,52 53,52C50.791,52 49,50.209 49,48C49,45.791 50.791,44 53,44Z" style={{ fill: 'white' }} />
            </g>
          </svg>
        )
      case 'google':
        return (
          <svg className="icon" width="100%" height="100%" viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" xmlSpace="preserve" style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 1.41421 }}>
            <g transform="matrix(2.66667,0,0,2.66667,-2.97874e-15,0)">
              <path d="M17.64,9.205C17.64,8.566 17.583,7.953 17.476,7.364L9,7.364L9,10.845L13.844,10.845C13.635,11.97 13.001,12.923 12.048,13.561L12.048,15.82L14.956,15.82C16.658,14.253 17.64,11.945 17.64,9.205Z" style={{ fill: 'rgb(66,133,244)' }} />
              <path d="M9,18C11.43,18 13.467,17.194 14.956,15.82L12.048,13.561C11.242,14.101 10.211,14.42 9,14.42C6.656,14.42 4.672,12.837 3.964,10.71L0.957,10.71L0.957,13.042C2.438,15.983 5.482,18 9,18Z" style={{ fill: 'rgb(52,168,83)' }} />
              <path d="M3.964,10.71C3.784,10.17 3.682,9.593 3.682,9C3.682,8.407 3.784,7.83 3.964,7.29L3.964,4.958L0.957,4.958C0.348,6.173 0,7.548 0,9C0,10.452 0.348,11.827 0.957,13.042L3.964,10.71Z" style={{ fill: 'rgb(251,188,5)' }} />
              <path d="M9,3.58C10.321,3.58 11.508,4.034 12.44,4.925L15.022,2.344C13.463,0.892 11.426,0 9,0C5.482,0 2.438,2.017 0.957,4.958L3.964,7.29C4.672,5.163 6.656,3.58 9,3.58Z" style={{ fill: 'rgb(234,67,53)' }} />
            </g>
          </svg>
        )
      default:
        // Ancient fallback (should no longer be used)
        return (
          <svg className="icon">
            <use xlinkHref={`#icon-${this.props.icon}`} />
          </svg>
        )
    }
  }
}
