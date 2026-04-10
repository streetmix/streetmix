import { getSlopeValues } from '~/src/segments/slope.js'
import { useDispatch, useSelector } from '~/src/store/hooks.js'
import { segmentsChanged } from '~/src/store/actions/street.js'
import { setSlopeValue } from '~/src/store/slices/street.js'
import { Button } from '~/src/ui/Button.js'

interface SlopeControlPinProps {
  position: number
  anchor: number
}

export function SlopeControlPin({ position, anchor }: SlopeControlPinProps) {
  const street = useSelector((state) => state.street)
  const dispatch = useDispatch()

  function onClick() {
    const values = getSlopeValues(street, position)

    dispatch(setSlopeValue(position, anchor, values[anchor]))
    dispatch(segmentsChanged())
  }

  return (
    <Button onClick={onClick} style={{ marginLeft: '0.25em' }}>
      pin
    </Button>
  )
}
