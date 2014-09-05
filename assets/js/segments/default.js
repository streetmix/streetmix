var DEFAULT_SEGMENTS = {
  'false': [ // Right-hand traffic
    { type: 'sidewalk', variant: { 'sidewalk-density': 'dense' }, width: 6 },
    { type: 'sidewalk-tree', variant: { 'tree-type': 'big' }, width: 2 },
    { type: 'transit-shelter', variant: { 'orientation': 'left', 'transit-shelter-elevation': 'street-level' }, width: 9 },
    { type: 'sidewalk-lamp', variant: { 'lamp-orientation': 'right', 'lamp-type': 'modern' }, width: 2 },
    { type: 'bus-lane', variant: { 'direction': 'inbound', 'public-transit-asphalt': 'regular' }, width: 10 },
    { type: 'turn-lane', variant: { 'direction': 'inbound', 'turn-lane-orientation': 'right-straight'}, width: 10 },
    { type: 'divider', variant: { 'divider-type': 'flowers' }, width: 3 },
    { type: 'drive-lane', variant: { 'direction': 'outbound', 'car-type': 'truck' }, width: 10 },
    { type: 'bike-lane', variant: { 'direction': 'outbound', 'bike-asphalt': 'colored' }, width: 6 },
    { type: 'parking-lane', variant: { 'parking-lane-direction': 'outbound', 'parking-lane-orientation': 'right' }, width: 8 },
    { type: 'sidewalk-lamp', variant: { 'lamp-orientation': 'left', 'lamp-type': 'modern' }, width: 2 },
    { type: 'sidewalk-tree', variant: { 'tree-type': 'big' }, width: 2 },
    { type: 'sidewalk-wayfinding', variant: { 'wayfinding-type': 'medium' }, width: 2 },
    { type: 'sidewalk', variant: { 'sidewalk-density': 'normal' }, width: 6 },
    { type: 'sidewalk-bench', variant: { 'bench-orientation': 'right' }, width: 2}
  ],
  'true': [ // Left-hand traffic
    { type: 'sidewalk-bench', variant: { 'bench-orientation': 'left' }, width: 2},
    { type: 'sidewalk', variant: { 'sidewalk-density': 'normal' }, width: 6 },
    { type: 'sidewalk-wayfinding', variant: { 'wayfinding-type': 'medium' }, width: 2 },
    { type: 'sidewalk-tree', variant: { 'tree-type': 'big' }, width: 2 },
    { type: 'sidewalk-lamp', variant: { 'lamp-orientation': 'right', 'lamp-type': 'modern' }, width: 2 },
    { type: 'parking-lane', variant: { 'parking-lane-direction': 'outbound', 'parking-lane-orientation': 'left' }, width: 8 },
    { type: 'bike-lane', variant: { 'direction': 'outbound', 'bike-asphalt': 'colored' }, width: 6 },
    { type: 'drive-lane', variant: { 'direction': 'outbound', 'car-type': 'truck' }, width: 10 },
    { type: 'divider', variant: { 'divider-type': 'flowers' }, width: 3 },
    { type: 'turn-lane', variant: { 'direction': 'inbound', 'turn-lane-orientation': 'left-straight'}, width: 10 },
    { type: 'bus-lane', variant: { 'direction': 'inbound', 'public-transit-asphalt': 'regular' }, width: 10 },
    { type: 'sidewalk-lamp', variant: { 'lamp-orientation': 'left', 'lamp-type': 'modern' }, width: 2 },
    { type: 'transit-shelter', variant: { 'orientation': 'right', 'transit-shelter-elevation': 'street-level' }, width: 9 },
    { type: 'sidewalk-tree', variant: { 'tree-type': 'big' }, width: 2 },
    { type: 'sidewalk', variant: { 'sidewalk-density': 'dense' }, width: 6 }
  ]
};
