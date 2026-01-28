import { useSelector, useDispatch } from '~/src/store/hooks.js'
import {
  hideCoastalFloodingPanel,
  setSeaLevelRise,
  setStormSurge,
  setRain,
  setFloodDirection,
} from '~/src/store/slices/coastmix.js'
import { Button } from '~/src/ui/Button.js'
import { Switch } from '~/src/ui/Switch.js'
import { FloatingPanel } from '~/src/ui/FloatingPanel.js'
import './CoastalFloodingPanel.css'

export function CoastalFloodingPanel() {
  const {
    controlsVisible,
    seaLevelRise,
    floodDirection,
    stormSurge,
    isRaining,
  } = useSelector((state) => state.coastmix)

  const dispatch = useDispatch()

  function handleClose(): void {
    dispatch(hideCoastalFloodingPanel())
  }

  function changeSeaLevelRise(x: number): void {
    dispatch(setSeaLevelRise(x))
  }

  const changeFloodDirection = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    dispatch(setFloodDirection(event.target.value))
  }

  return (
    <FloatingPanel
      icon="boat"
      title="Coastal flooding"
      show={controlsVisible}
      className="coastmix-controls"
      handleClose={handleClose}
    >
      <div className="popup-controls flood-controls-content">
        <div className="popup-control-group">
          <div className="popup-control-label">Sea level rise</div>
          <div>
            <Button
              className={`sea-level-button${seaLevelRise === 0 ? ' sea-level-selected' : ''}`}
              onClick={() => {
                changeSeaLevelRise(0)
              }}
            >
              Current
            </Button>
            <Button
              className={`sea-level-button${seaLevelRise === 2030 ? ' sea-level-selected' : ''}`}
              onClick={() => {
                changeSeaLevelRise(2030)
              }}
            >
              2030
            </Button>
            <Button
              className={`sea-level-button${seaLevelRise === 2050 ? ' sea-level-selected' : ''}`}
              onClick={() => {
                changeSeaLevelRise(2050)
              }}
            >
              2050
            </Button>
            <Button
              className={`sea-level-button${seaLevelRise === 2070 ? ' sea-level-selected' : ''}`}
              onClick={() => {
                changeSeaLevelRise(2070)
              }}
            >
              2070
            </Button>
          </div>
        </div>
        <div className="popup-control-group">
          <div className="popup-control-label">Flood direction</div>
          <div>
            <select value={floodDirection} onChange={changeFloodDirection}>
              <option value="none">None</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>
        <div className="popup-control-group">
          <div className="popup-control-label">Storm surge</div>
          <Switch
            onCheckedChange={(checked) => {
              dispatch(setStormSurge(checked))
            }}
            checked={stormSurge}
          />
        </div>
        <div className="popup-control-group">
          <div className="popup-control-label">Rain</div>
          <Switch
            onCheckedChange={(checked) => {
              dispatch(setRain(checked))
            }}
            checked={isRaining}
          />
        </div>
      </div>
    </FloatingPanel>
  )
}
