import {
  CoastalFloodingButton,
  CoastalFloodingPanel,
} from '~/src/plugins/coastmix'
import { useSelector } from '~/src/store/hooks'
// import { ShepherdTest } from '~src/ui/Tours/ShepherdTest.js'

export function CoastmixUI() {
  const coastmixMode = useSelector((state) => state.flags.COASTMIX_MODE.value)

  if (!coastmixMode) return null

  return (
    <>
      <CoastalFloodingButton />
      <CoastalFloodingPanel />
      {/* <ShepherdTest /> */}
    </>
  )
}
