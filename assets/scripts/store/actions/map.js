import { SET_MAP_STATE, RESET_MAP_STATE } from './index'

export function setMapState (mapState) {
  return {
    ...mapState,
    type: SET_MAP_STATE
  }
}

export function resetMapState () {
  return {
    type: RESET_MAP_STATE
  }
}
