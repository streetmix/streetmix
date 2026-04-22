import { useSelector } from '../store/hooks.js'
import { PaletteItems } from './PaletteItems.js'
import { PaletteTrashcan } from './PaletteTrashcan.js'
import { EnvironmentButton } from './EnvironmentButton.js'
import { FloodingButton } from './FloodingButton.js'
import { UndoRedo } from './UndoRedo.js'
import './PaletteContainer.css'

export function PaletteContainer() {
  const readOnly = useSelector((state) => state.app.readOnly)
  const coastmixMode = useSelector(
    (state) => state.flags.COASTMIX_MODE?.value ?? false
  )

  // Do not render the palette if app is in read-only mode
  if (readOnly) return null

  return (
    <div className="palette-container-outer">
      <div className="palette-container">
        <div className="palette-commands palette-commands-left">
          <EnvironmentButton />
          {coastmixMode && <FloodingButton />}
        </div>
        <PaletteItems />
        <div className="palette-commands palette-commands-right">
          <UndoRedo />
        </div>
        <PaletteTrashcan />
      </div>
    </div>
  )
}
