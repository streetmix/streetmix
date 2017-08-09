import { SET_MAP_STATE } from './index'

export function setMapState (mapState) {
  return {
    ...mapState,
    type: SET_MAP_STATE
  }
}
