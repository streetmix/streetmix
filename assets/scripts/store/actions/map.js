import { SET_MAP_STATE } from './index'

const mapState = {}

export function setMapState (mapState) {
  return {
    type: SET_MAP_STATE
  }
}
