// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import ELEMENT_LOOKUP from '../../../client/src/segments/segment-lookup.json' with { type: 'json' }
import { GROUND_BASELINE_HEIGHT, TILE_SIZE } from './constants.js'
import { prettifyWidth } from './dimensions.js'

import type * as Canvas from '@napi-rs/canvas'
import type { Street } from '@streetmix/types'

const ELEMENT_LABEL_BACKGROUND = 'rgb(216, 211, 203)'
const ELEMENT_LABEL_FONT = 'Geist Sans'
const ELEMENT_LABEL_FONT_SIZE = 12
const ELEMENT_LABEL_FONT_WEIGHT = '400'

/**
 * Draws section element label background.
 *
 * @modifies {CanvasRenderingContext2D} ctx
 */
export function drawElementLabelBackground (
  ctx: Canvas.SKRSContext2D,
  width: number,
  height: number,
  groundLevel: number,
  scale: number
): void {
  ctx.save()

  ctx.fillStyle = ELEMENT_LABEL_BACKGROUND
  ctx.fillRect(
    0,
    (groundLevel + GROUND_BASELINE_HEIGHT) * scale,
    width * scale,
    (height - groundLevel - GROUND_BASELINE_HEIGHT) * scale
  )

  ctx.restore()
}

/**
 * Draws section element labels.
 *
 * @modifies {CanvasRenderingContext2D} ctx
 */
export function drawElementLabels (
  ctx: Canvas.SKRSContext2D,
  streetData: Street,
  groundLevel: number,
  offsetLeft: number,
  scale: number
): void {
  const street = streetData.data.street

  ctx.save()

  ctx.lineWidth = 0.25 * scale

  ctx.font = `normal ${ELEMENT_LABEL_FONT_WEIGHT} ${
    ELEMENT_LABEL_FONT_SIZE * scale
  }px ${ELEMENT_LABEL_FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.strokeStyle = 'black'
  ctx.fillStyle = 'black'

  street.segments.forEach((element, i) => {
    const availableWidth = element.width * TILE_SIZE

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
    const text = prettifyWidth(element.width, street.units)
    ctx.fillText(text, x * scale, (groundLevel + 60) * scale)

    // Segment name label
    const name =
      element.label ?? getElementName(element.type, element.variantString)
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

export function drawLine (
  ctx: Canvas.SKRSContext2D | CanvasRenderingContext2D,
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

/**
 * Ported from client, but this has never been used
 */
export function drawArrowLine (
  ctx: Canvas.SKRSContext2D | CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  scale: number,
  text?: string
): void {
  x1 += 2
  x2 -= 2

  drawLine(ctx, x1, y1, x2, y2, scale)

  if (text) {
    ctx.save()
    ctx.font = 12 * scale + 'px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(text, ((x1 + x2) / 2) * scale, y1 * scale - 10)
    ctx.restore()
  }
}

const ELEMENT_UNKNOWN = {
  unknown: true,
  name: 'Unknown',
  owner: 'NONE',
  zIndex: 1,
  variants: [],
  details: {}
}

export const ELEMENT_UNKNOWN_VARIANT = {
  unknown: true,
  name: 'Unknown',
  graphics: {
    center: 'missing'
  }
}

function getElementName (type: string, variant: string): string {
  const elementInfo = getElementInfo(type)
  const variantInfo = getElementVariantInfo(type, variant)
  const defaultName = variantInfo.name ?? elementInfo.name
  return defaultName
}

function getElementInfo (type: string): unknown {
  return ELEMENT_LOOKUP[type] ?? ELEMENT_UNKNOWN
}

function getElementVariant (type: string, variant: string): unknown {
  return ELEMENT_LOOKUP[type]?.details?.[variant]
}

function applyElementInfoOverridesAndRules (details, elementRules): unknown {
  const { rules, ...overrides } = details
  return Object.assign({}, elementRules, rules, overrides)
}

function getElementVariantInfo (type: string, variant: string): unknown {
  const elementVariant = getElementVariant(type, variant)
  const { rules } = getElementInfo(type)

  if (elementVariant?.components === undefined) {
    return ELEMENT_UNKNOWN_VARIANT
  }

  const { components, ...details } = elementVariant
  const variantInfo = applyElementInfoOverridesAndRules(details, rules)

  // TODO: Bring the following back when we need element info.
  // variantInfo.graphics = getElementSprites(components)

  // // Assuming a element has one "lane" component, a element's elevation can be found using the id
  // // of the first item in the "lane" component group.
  // const lane = getElementComponentInfo(
  //   COMPONENT_GROUPS.LANES,
  //   components.lanes[0].id
  // )
  // variantInfo.elevation = lane.elevation

  return variantInfo
}
