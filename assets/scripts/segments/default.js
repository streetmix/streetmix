export const DEFAULT_SEGMENTS = {
  'false': [ // Right-hand traffic
    { type: 'sidewalk', variant: { 'sidewalk-density': 'dense' }, width: 10 },
    { type: 'sidewalk-lamp', variant: { 'lamp-orientation': 'right', 'lamp-type': 'modern' }, width: 5 },
    { type: 'parking-lane', variant: { 'parking-lane-direction': 'inbound', 'parking-lane-orientation': 'left' }, width: 8 },
    { type: 'drive-lane', variant: { 'direction': 'inbound', 'car-type': 'truck' }, width: 14 },
    { type: 'drive-lane', variant: { 'direction': 'outbound', 'car-type': 'car' }, width: 14 },
    { type: 'parking-lane', variant: { 'parking-lane-direction': 'outbound', 'parking-lane-orientation': 'right' }, width: 8 },
    { type: 'sidewalk-lamp', variant: { 'lamp-orientation': 'left', 'lamp-type': 'modern' }, width: 5 },
    { type: 'sidewalk', variant: { 'sidewalk-density': 'dense' }, width: 10 }
  ],
  'true': [ // Left-hand traffic
    { type: 'sidewalk', variant: { 'sidewalk-density': 'normal' }, width: 6 },
    { type: 'sidewalk-tree', variant: { 'tree-type': 'big' }, width: 2 },
    { type: 'sidewalk-lamp', variant: { 'lamp-orientation': 'right', 'lamp-type': 'modern' }, width: 2 },
    { type: 'bike-lane', variant: { 'direction': 'outbound', 'bike-asphalt': 'colored' }, width: 6 },
    { type: 'divider', variant: { 'divider-type': 'planter-box' }, width: 4 },
    { type: 'parking-lane', variant: { 'parking-lane-direction': 'outbound', 'parking-lane-orientation': 'left' }, width: 7 },
    { type: 'turn-lane', variant: { 'direction': 'outbound', 'turn-lane-orientation': 'right-straight' }, width: 10 },
    { type: 'divider', variant: { 'divider-type': 'bush' }, width: 3 },
    { type: 'drive-lane', variant: { 'direction': 'inbound', 'car-type': 'car' }, width: 9 },
    { type: 'bus-lane', variant: { 'direction': 'inbound', 'bus-asphalt': 'shared' }, width: 12 },
    { type: 'sidewalk-lamp', variant: { 'lamp-orientation': 'left', 'lamp-type': 'modern' }, width: 2 },
    { type: 'transit-shelter', variant: { 'orientation': 'right', 'transit-shelter-elevation': 'street-level' }, width: 9 },
    { type: 'sidewalk-tree', variant: { 'tree-type': 'big' }, width: 2 },
    { type: 'sidewalk', variant: { 'sidewalk-density': 'dense' }, width: 6 }
  ]
}
