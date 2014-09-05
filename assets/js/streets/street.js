var street = {
  schemaVersion: LATEST_SCHEMA_VERSION,

  id: null,
  creatorId: null,
  namespacedId: null,
  originalStreetId: null, // id of the street the current street is remixed from (could be null)
  name: null,
  editCount: null, // Since new street or remix · FIXME: can be null (meaning = don’t touch), but this will change

  width: null,
  occupiedWidth: null, // Can be recreated, do not save
  remainingWidth: null, // Can be recreated, do not save

  leftBuildingHeight: null,
  rightBuildingHeight: null,
  leftBuildingVariant: null,
  rightBuildingVariant: null,

  segments: [],

  units: null
};
