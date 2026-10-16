import { CoastalFloodingPanel } from '~/src/plugins/coastmix'
import { useSelector } from '~/src/store/hooks.js'
import { FloodingDebugOverlay } from './FloodingDebugOverlay.js'
import './CoastmixUI.css'

export function CoastmixUI() {
  const coastmixMode = useSelector((state) => state.flags.COASTMIX_MODE.value)

  if (!coastmixMode) return null

  return (
    <>
      <FloodingDebugOverlay on={false} />
      <CoastalFloodingPanel />
    </>
  )
}
