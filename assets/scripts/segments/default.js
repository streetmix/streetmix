export const DEFAULT_SEGMENTS = {
  false: [
    // Right-hand traffic
    { type: 'sidewalk', variant: { 'sidewalk-density': 'dense' }, width: 1.8 },
    { type: 'sidewalk-tree', variant: { 'tree-type': 'big' }, width: 0.6 },
    {
      type: 'transit-shelter',
      variant: {
        orientation: 'left',
        'transit-shelter-elevation': 'street-level'
      },
      width: 2.7
    },
    {
      type: 'sidewalk-lamp',
      variant: { 'lamp-orientation': 'right', 'lamp-type': 'modern' },
      width: 0.6
    },
    {
      type: 'bus-lane',
      variant: {
        direction: 'inbound',
        'bus-asphalt': 'shared',
        'bus-type': 'typical'
      },
      width: 3.6
    },
    {
      type: 'drive-lane',
      variant: { direction: 'inbound', 'car-type': 'car' },
      width: 2.7
    },
    { type: 'divider', variant: { 'divider-type': 'bush' }, width: 0.9 },
    {
      type: 'turn-lane',
      variant: {
        direction: 'outbound',
        'turn-lane-orientation': 'left-straight'
      },
      width: 3
    },
    {
      type: 'parking-lane',
      variant: {
        'parking-lane-direction': 'outbound',
        'parking-lane-orientation': 'right'
      },
      width: 2.1
    },
    { type: 'divider', variant: { 'divider-type': 'planter-box' }, width: 1.2 },
    {
      type: 'bike-lane',
      variant: {
        'bike-direction': 'outbound',
        'bike-asphalt': 'green',
        elevation: 'road'
      },
      width: 1.8
    },
    {
      type: 'sidewalk-lamp',
      variant: { 'lamp-orientation': 'left', 'lamp-type': 'modern' },
      width: 0.6
    },
    { type: 'sidewalk-tree', variant: { 'tree-type': 'big' }, width: 0.6 },
    { type: 'sidewalk', variant: { 'sidewalk-density': 'normal' }, width: 1.8 }
  ],
  true: [
    // Left-hand traffic
    { type: 'sidewalk', variant: { 'sidewalk-density': 'normal' }, width: 1.8 },
    { type: 'sidewalk-tree', variant: { 'tree-type': 'big' }, width: 0.6 },
    {
      type: 'sidewalk-lamp',
      variant: { 'lamp-orientation': 'right', 'lamp-type': 'modern' },
      width: 0.6
    },
    {
      type: 'bike-lane',
      variant: {
        'bike-direction': 'outbound',
        'bike-asphalt': 'green',
        elevation: 'road'
      },
      width: 1.8
    },
    { type: 'divider', variant: { 'divider-type': 'planter-box' }, width: 1.2 },
    {
      type: 'parking-lane',
      variant: {
        'parking-lane-direction': 'outbound',
        'parking-lane-orientation': 'left'
      },
      width: 2.1
    },
    {
      type: 'turn-lane',
      variant: {
        direction: 'outbound',
        'turn-lane-orientation': 'right-straight'
      },
      width: 3
    },
    { type: 'divider', variant: { 'divider-type': 'bush' }, width: 0.9 },
    {
      type: 'drive-lane',
      variant: { direction: 'inbound', 'car-type': 'car' },
      width: 2.7
    },
    {
      type: 'bus-lane',
      variant: {
        direction: 'inbound',
        'bus-asphalt': 'shared',
        'bus-type': 'typical'
      },
      width: 3.6
    },
    {
      type: 'sidewalk-lamp',
      variant: { 'lamp-orientation': 'left', 'lamp-type': 'modern' },
      width: 0.6
    },
    {
      type: 'transit-shelter',
      variant: {
        orientation: 'right',
        'transit-shelter-elevation': 'street-level'
      },
      width: 2.7
    },
    { type: 'sidewalk-tree', variant: { 'tree-type': 'big' }, width: 0.6 },
    { type: 'sidewalk', variant: { 'sidewalk-density': 'dense' }, width: 1.8 }
  ]
}
