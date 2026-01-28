import {
  CoastalFloodingButton,
  CoastalFloodingPanel,
} from '~/src/plugins/coastmix'
import { useSelector } from '~/src/store/hooks'

export function CoastmixUI() {
  const coastmixMode = useSelector((state) => state.flags.COASTMIX_MODE.value)

  if (!coastmixMode) return null

  return (
    <>
      <CoastalFloodingButton />
      <CoastalFloodingPanel />
    </>
  )
}
