// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import SEGMENT_LOOKUP from '../../../client/src/segments/segment-lookup.json' with { type: 'json' }
import { GROUND_BASELINE_HEIGHT, TILE_SIZE } from './constants.js'
import { prettifyWidth } from './dimensions.js'

import type * as Canvas from '@napi-rs/canvas'
import type { Street } from '@streetmix/types'

const LABEL_BACKGROUND = 'rgb(216, 211, 203)'

const SEGMENT_NAME_FONT = 'Geist Sans'
const SEGMENT_NAME_FONT_SIZE = 12
const SEGMENT_NAME_FONT_WEIGHT = '400'

/**
 * Draws segment label background.
 *
 * @modifies {CanvasRenderingContext2D} ctx
 */
export function drawSegmentLabelBackground (
  ctx: Canvas.SKRSContext2D,
  width: number,
  height: number,
  groundLevel: number,
  scale: number
): void {
  ctx.save()

  ctx.fillStyle = LABEL_BACKGROUND
  ctx.fillRect(
    0,
    (groundLevel + GROUND_BASELINE_HEIGHT) * scale,
    width * scale,
    (height - groundLevel - GROUND_BASELINE_HEIGHT) * scale
  )

  ctx.restore()
}

/**
 * Draws segment labels.
 *
 * @modifies {CanvasRenderingContext2D} ctx
 */
export function drawSegmentLabels (
  ctx: Canvas.SKRSContext2D,
  streetData: Street,
  groundLevel: number,
  offsetLeft: number,
  scale: number
): void {
  const street = streetData.data.street

  ctx.save()

  ctx.lineWidth = 0.25 * scale

  ctx.font = `normal ${SEGMENT_NAME_FONT_WEIGHT} ${
    SEGMENT_NAME_FONT_SIZE * scale
  }px ${SEGMENT_NAME_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.strokeStyle = 'black'
  ctx.fillStyle = 'black'

  street.segments.forEach((segment, i) => {
    const availableWidth = segment.width * TILE_SIZE

    let left = offsetLeft

    if (i === 0) {
      left--
    }

    // Left line
    drawLine(
      ctx,
      left,
      groundLevel + GROUND_BASELINE_HEIGHT,
      left,
      groundLevel + 125,
      scale
    )

    const x = offsetLeft + availableWidth / 2

    // Width label
    const text = prettifyWidth(segment.width, street.units)
    ctx.fillText(text, x * scale, (groundLevel + 60) * scale)

    // Segment name label
    const name =
      segment.label ?? getSegmentName(segment.type, segment.variantString)
    const nameWidth = ctx.measureText(name).width / scale

    if (nameWidth <= availableWidth - 10) {
      ctx.fillText(name, x * scale, (groundLevel + 83) * scale)
    }

    offsetLeft += availableWidth
  })

  // Final right-hand side line
  const left = offsetLeft + 1
  drawLine(
    ctx,
    left,
    groundLevel + GROUND_BASELINE_HEIGHT,
    left,
    groundLevel + 125,
    scale
  )

  ctx.restore()
}

function drawLine (
  ctx: Canvas.SKRSContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  scale: number
): void {
  x1 *= scale
  y1 *= scale
  x2 *= scale
  y2 *= scale

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.restore()
}

// function drawArrowLine (ctx, x1, y1, x2, y2, text, dpi) {
//   x1 += 2
//   x2 -= 2

//   drawLine(ctx, x1, y1, x2, y2, dpi)

//   if (text) {
//     ctx.font = 12 * dpi + 'px Arial'
//     ctx.textAlign = 'center'
//     ctx.fillText(text, ((x1 + x2) / 2) * dpi, y1 * dpi - 10)
//   }
// }
const SEGMENT_UNKNOWN = {
  unknown: true,
  name: 'Unknown',
  owner: 'NONE',
  zIndex: 1,
  variants: [],
  details: {}
}

export const SEGMENT_UNKNOWN_VARIANT = {
  unknown: true,
  name: 'Unknown',
  graphics: {
    center: 'missing'
  }
}

function getSegmentName (type: string, variant: string): string {
  const segmentInfo = getSegmentInfo(type)
  const variantInfo = getSegmentVariantInfo(type, variant)
  const defaultName = variantInfo.name ?? segmentInfo.name
  return defaultName
}

function getSegmentInfo (type: string): unknown {
  return SEGMENT_LOOKUP[type] ?? SEGMENT_UNKNOWN
}

function getSegmentLookup (type: string, variant: string): unknown {
  return SEGMENT_LOOKUP[type]?.details?.[variant]
}

function applySegmentInfoOverridesAndRules (details, segmentRules): unknown {
  const { rules, ...segmentInfoOverrides } = details
  return Object.assign({}, segmentRules, rules, segmentInfoOverrides)
}

function getSegmentVariantInfo (type: string, variant: string): unknown {
  const segmentLookup = getSegmentLookup(type, variant)
  const { rules } = getSegmentInfo(type)

  if (segmentLookup?.components === undefined) {
    return SEGMENT_UNKNOWN_VARIANT
  }

  const { components, ...details } = segmentLookup
  const variantInfo = applySegmentInfoOverridesAndRules(details, rules)

  // TODO: Bring the following back when we need segment info.
  // variantInfo.graphics = getSegmentSprites(components)

  // // Assuming a segment has one "lane" component, a segment's elevation can be found using the id
  // // of the first item in the "lane" component group.
  // const lane = getSegmentComponentInfo(
  //   COMPONENT_GROUPS.LANES,
  //   components.lanes[0].id
  // )
  // variantInfo.elevation = lane.elevation

  return variantInfo
}
