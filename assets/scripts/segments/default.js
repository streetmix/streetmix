export const DEFAULT_SEGMENTS = {
  false: [
    // Right-hand traffic
    { type: 'sidewalk', variant: { 'sidewalk-density': 'dense' }, width: 6 },
    { type: 'sidewalk-tree', variant: { 'tree-type': 'big' }, width: 2 },
    {
      type: 'transit-shelter',
      variant: {
        orientation: 'left',
        'transit-shelter-elevation': 'street-level'
      },
      width: 9
    },
    {
      type: 'sidewalk-lamp',
      variant: { 'lamp-orientation': 'right', 'lamp-type': 'modern' },
      width: 2
    },
    {
      type: 'bus-lane',
      variant: {
        direction: 'inbound',
        'bus-asphalt': 'shared',
        'bus-type': 'typical'
      },
      width: 12
    },
    {
      type: 'drive-lane',
      variant: { direction: 'inbound', 'car-type': 'car' },
      width: 9
    },
    { type: 'divider', variant: { 'divider-type': 'bush' }, width: 3 },
    {
      type: 'turn-lane',
      variant: {
        direction: 'outbound',
        'turn-lane-orientation': 'left-straight'
      },
      width: 10
    },
    {
      type: 'parking-lane',
      variant: {
        'parking-lane-direction': 'outbound',
        'parking-lane-orientation': 'right'
      },
      width: 7
    },
    { type: 'divider', variant: { 'divider-type': 'planter-box' }, width: 4 },
    {
      type: 'bike-lane',
      variant: {
        'bike-direction': 'outbound',
        'bike-asphalt': 'green',
        elevation: 'road'
      },
      width: 6
    },
    {
      type: 'sidewalk-lamp',
      variant: { 'lamp-orientation': 'left', 'lamp-type': 'modern' },
      width: 2
    },
    { type: 'sidewalk-tree', variant: { 'tree-type': 'big' }, width: 2 },
    { type: 'sidewalk', variant: { 'sidewalk-density': 'normal' }, width: 6 }
  ],
  true: [
    // Left-hand traffic
    { type: 'sidewalk', variant: { 'sidewalk-density': 'normal' }, width: 6 },
    { type: 'sidewalk-tree', variant: { 'tree-type': 'big' }, width: 2 },
    {
      type: 'sidewalk-lamp',
      variant: { 'lamp-orientation': 'right', 'lamp-type': 'modern' },
      width: 2
    },
    {
      type: 'bike-lane',
      variant: {
        'bike-direction': 'outbound',
        'bike-asphalt': 'green',
        elevation: 'road'
      },
      width: 6
    },
    { type: 'divider', variant: { 'divider-type': 'planter-box' }, width: 4 },
    {
      type: 'parking-lane',
      variant: {
        'parking-lane-direction': 'outbound',
        'parking-lane-orientation': 'left'
      },
      width: 7
    },
    {
      type: 'turn-lane',
      variant: {
        direction: 'outbound',
        'turn-lane-orientation': 'right-straight'
      },
      width: 10
    },
    { type: 'divider', variant: { 'divider-type': 'bush' }, width: 3 },
    {
      type: 'drive-lane',
      variant: { direction: 'inbound', 'car-type': 'car' },
      width: 9
    },
    {
      type: 'bus-lane',
      variant: {
        direction: 'inbound',
        'bus-asphalt': 'shared',
        'bus-type': 'typical'
      },
      width: 12
    },
    {
      type: 'sidewalk-lamp',
      variant: { 'lamp-orientation': 'left', 'lamp-type': 'modern' },
      width: 2
    },
    {
      type: 'transit-shelter',
      variant: {
        orientation: 'right',
        'transit-shelter-elevation': 'street-level'
      },
      width: 9
    },
    { type: 'sidewalk-tree', variant: { 'tree-type': 'big' }, width: 2 },
    { type: 'sidewalk', variant: { 'sidewalk-density': 'dense' }, width: 6 }
  ]
}
