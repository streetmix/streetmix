import { SET_MAP_STATE } from './index'

const mapState = {}

export function setMapState (mapState) {
  return {
    ...mapState,
    type: SET_MAP_STATE
  }
}
