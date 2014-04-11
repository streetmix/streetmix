var FLAG_SAVE_UNDO = false; // true to save undo with street data, false to not save undo

var IP_GEOLOCATION_API_URL = 'http://freegeoip.net/json/';
var IP_GEOLOCATION_TIMEOUT = 1000; // After this time, we don’t wait any more

// TODO replace the URLs in index.html dynamically
var URL_SIGN_IN = 'twitter-sign-in';

var URL_SIGN_IN_CALLBACK_ABS = 
    location.protocol + '//' + location.host + URL_SIGN_IN_CALLBACK_REL;
var URL_SIGN_IN_CALLBACK = URL_SIGN_IN_CALLBACK_REL.replace(/^\//, '');

var URL_JUST_SIGNED_IN_REL = '/just-signed-in';
var URL_JUST_SIGNED_IN_ABS = 
    location.protocol + '//' + location.host + URL_JUST_SIGNED_IN_REL;
var URL_JUST_SIGNED_IN = URL_JUST_SIGNED_IN_REL.replace(/^\//, '');

var URL_JUST_SIGNED_IN = 'just-signed-in'; // TODO fix this
var URL_NEW_STREET = 'new';
var URL_NEW_STREET_COPY_LAST = 'copy-last';
var URL_GLOBAL_GALLERY = 'gallery';
var URL_ERROR = 'error';
var URL_NO_USER = '-';
var URL_HELP = 'help';
var URL_ABOUT = 'about';
var URL_HELP_ABOUT = '#/' + URL_HELP + '/' + URL_ABOUT;

var URL_ERROR_TWITTER_ACCESS_DENIED = 'twitter-access-denied';
var URL_ERROR_NO_TWITTER_REQUEST_TOKEN = 'no-twitter-request-token';
var URL_ERROR_NO_TWITTER_ACCESS_TOKEN = 'no-twitter-access-token';
var URL_ERROR_AUTHENTICATION_API_PROBLEM = 'authentication-api-problem';

var URL_EXAMPLE_STREET = 'saikofish/29';

var URL_SIGN_IN_REDIRECT = URL_SIGN_IN + '?callbackUri=' +
    URL_SIGN_IN_CALLBACK_ABS + '&redirectUri=' + URL_JUST_SIGNED_IN_ABS;

// Since URLs like “streetmix.net/new” are reserved, but we still want
// @new to be able to use Streetmix, we prefix any reserved URLs with ~
var RESERVED_URLS =
    [URL_SIGN_IN, URL_SIGN_IN_CALLBACK,
    URL_NEW_STREET, URL_NEW_STREET_COPY_LAST,
    URL_JUST_SIGNED_IN,
    URL_HELP, URL_GLOBAL_GALLERY, URL_ERROR, 'streets'];
var URL_RESERVED_PREFIX = '~';

var MODE_CONTINUE = 1;
var MODE_NEW_STREET = 2;
var MODE_NEW_STREET_COPY_LAST = 3;
var MODE_JUST_SIGNED_IN = 4;
var MODE_EXISTING_STREET = 5;
var MODE_404 = 6;
var MODE_SIGN_OUT = 7;
var MODE_FORCE_RELOAD_SIGN_IN = 8;
var MODE_FORCE_RELOAD_SIGN_OUT = 9;
var MODE_USER_GALLERY = 10;
var MODE_GLOBAL_GALLERY = 11;
var MODE_FORCE_RELOAD_SIGN_OUT_401 = 12;
var MODE_ERROR = 13;
var MODE_UNSUPPORTED_BROWSER = 14;
var MODE_STREET_404 = 15;
var MODE_STREET_404_BUT_LINK_TO_USER = 16;
var MODE_STREET_410_BUT_LINK_TO_USER = 17;
var MODE_ABOUT = 18;

var ERROR_404 = 1;
var ERROR_SIGN_OUT = 2;
var ERROR_NO_STREET = 3; // for gallery if you delete the street you were looking at
var ERROR_FORCE_RELOAD_SIGN_IN = 4;
var ERROR_FORCE_RELOAD_SIGN_OUT = 5;
var ERROR_STREET_DELETED_ELSEWHERE = 6;
var ERROR_NEW_STREET_SERVER_FAILURE = 7;
var ERROR_FORCE_RELOAD_SIGN_OUT_401 = 8;
var ERROR_TWITTER_ACCESS_DENIED = 9;
var ERROR_AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN = 10;
var ERROR_AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN = 11;
var ERROR_AUTH_PROBLEM_API_PROBLEM = 12;
var ERROR_GENERIC_ERROR = 13;
var ERROR_UNSUPPORTED_BROWSER = 14;
var ERROR_STREET_404 = 15;
var ERROR_STREET_404_BUT_LINK_TO_USER = 16;
var ERROR_STREET_410_BUT_LINK_TO_USER = 17;
var ERROR_CANNOT_CREATE_NEW_STREET_ON_PHONE = 18;
var ERROR_SIGN_IN_SERVER_FAILURE = 19;
var ERROR_SIGN_IN_401 = 20;

var TWITTER_ID = '@streetmixapp';

var NEW_STREET_DEFAULT = 1;
var NEW_STREET_EMPTY = 2;

var BUILDING_DESTINATION_SCREEN = 1;
var BUILDING_DESTINATION_THUMBNAIL = 2;

var LATEST_SCHEMA_VERSION = 16;
  // 1: starting point
  // 2: adding leftBuildingHeight and rightBuildingHeight
  // 3: adding leftBuildingVariant and rightBuildingVariant
  // 4: adding transit shelter elevation
  // 5: adding another lamp type (traditional)
  // 6: colored streetcar lanes
  // 7: colored bus and light rail lanes
  // 8: colored bike lane
  // 9: second car type: truck
  // 10: sidewalk density
  // 11: unify median and planting strip into divider
  // 12: getting rid of small tree
  // 13: bike rack elevation
  // 14: wayfinding has three types
  // 15: sidewalks have rand seed
  // 16: stop saving undo stack
var TILESET_IMAGE_VERSION = 55;
var TILESET_POINT_PER_PIXEL = 2.0;
var TILE_SIZE = 12; // pixels
var TILESET_CORRECTION = [null, 0, -84, -162];

var VARIANT_ICON_START_X = 164; // x24 in tileset file
var VARIANT_ICON_START_Y = 64; // x24 in tileset file
var VARIANT_ICON_SIZE = 24;

var IMAGES_TO_BE_LOADED = [
  '/assets/tiles-1.png',
  '/assets/tiles-2.png',
  '/assets/tiles-3.png',
  '/assets/sky-front.png',
  '/assets/sky-rear.png',
  '/assets/share-icons/facebook-29.png',
  '/assets/share-icons/twitter-32.png'
];

// Output using cmap2file as per 
// http://www.typophile.com/node/64147#comment-380776
var STREET_NAME_FONT_GLYPHS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĆćĈĉĊċČčĎďĒĔĕĖėĜĝĞğĠġĤĥĨĩĪīĬĭİıĴĵĹĺĽľŁłŃŇňŌōŎŏŐőŒœŔŕŘřŚśŜŝŞşŠšŤťŨũŪūŬŭŮůŰűŴŵŶŷŸŹźŻżŽžƒˆˇ˘˙˚˛˜˝–—‘’‚“”„†‡•…‰‹›⁄€™−';
var STREET_NAME_REMIX_SUFFIX = '(remix)';
var MAX_STREET_NAME_WIDTH = 50;

var WIDTH_PALETTE_MULTIPLIER = 4;

var CANVAS_HEIGHT = 480;
var CANVAS_GROUND = 35;
var CANVAS_BASELINE = CANVAS_HEIGHT - CANVAS_GROUND;

var SEGMENT_Y_NORMAL = 265;
var SEGMENT_Y_PALETTE = 20;
var PALETTE_EXTRA_SEGMENT_PADDING = 8;

var DRAG_OFFSET_Y_PALETTE = -340 - 150;
var DRAG_OFFSET_Y_TOUCH_PALETTE = -100;
var DRAG_OFFSET_Y_TOUCH = -100;

var THUMBNAIL_WIDTH = 180;
var THUMBNAIL_HEIGHT = 110;
var THUMBNAIL_MULTIPLIER = .1 * 2;
var BACKGROUND_DIRT_COLOUR = 'rgb(53, 45, 39)';

var WIDTH_CHART_WIDTH = 500;
var WIDTH_CHART_EMPTY_OWNER_WIDTH = 40;
var WIDTH_CHART_MARGIN = 20;

var DRAGGING_TYPE_NONE = 0;
var DRAGGING_TYPE_CLICK_OR_MOVE = 1;
var DRAGGING_TYPE_MOVE = 2;
var DRAGGING_TYPE_RESIZE = 3;

var DRAGGING_TYPE_MOVE_TRANSFER = 1;
var DRAGGING_TYPE_MOVE_CREATE = 2;

var DRAGGING_MOVE_HOLE_WIDTH = 40;

var STATUS_MESSAGE_HIDE_DELAY = 15000;
var WIDTH_EDIT_INPUT_DELAY = 200;
var SHORT_DELAY = 100;

var TOUCH_CONTROLS_FADEOUT_TIME = 3000;
var TOUCH_CONTROLS_FADEOUT_DELAY = 3000;

var SEGMENT_SWITCHING_TIME = 250;

var SAVE_STREET_DELAY = 500;
var SAVE_SETTINGS_DELAY = 500;
var NO_CONNECTION_MESSAGE_TIMEOUT = 10000;

var BLOCKING_SHIELD_DARKEN_DELAY = 800;
var BLOCKING_SHIELD_TOO_SLOW_DELAY = 10000;

var BUILDING_SPACE = 360;

var MAX_DRAG_DEGREE = 20;

var UNDO_LIMIT = 1000;

var STREET_WIDTH_CUSTOM = -1;
var STREET_WIDTH_SWITCH_TO_METRIC = -2;
var STREET_WIDTH_SWITCH_TO_IMPERIAL = -3;

var DEFAULT_NAME = msg('DEFAULT_STREET_NAME');
var DEFAULT_STREET_WIDTH = 80;
var DEFAULT_STREET_WIDTHS = [40, 60, 80];
var DEFAULT_BUILDING_HEIGHT_LEFT = 4;
var DEFAULT_BUILDING_HEIGHT_RIGHT = 3;
var DEFAULT_BUILDING_VARIANT_LEFT = 'narrow';
var DEFAULT_BUILDING_VARIANT_RIGHT = 'wide';
var DEFAULT_BUILDING_HEIGHT_EMPTY = 1;
var DEFAULT_BUILDING_VARIANT_EMPTY = 'grass';

var BUILDING_VARIANTS = ['waterfront', 'grass', 'fence', 'parking-lot',
                         'residential', 'narrow', 'wide'];
var BUILDING_VARIANT_NAMES = ['Waterfront', 'Grass', 'Empty lot', 'Parking lot',
                              'Home', 'Building', 'Building'];

var MIN_CUSTOM_STREET_WIDTH = 10;
var MAX_CUSTOM_STREET_WIDTH = 400;
var MIN_SEGMENT_WIDTH = 1;
var MAX_SEGMENT_WIDTH = 400;
var MAX_BUILDING_HEIGHT = 20;
var MAX_CANVAS_HEIGHT = 2048;

var RESIZE_TYPE_INITIAL = 0;
var RESIZE_TYPE_INCREMENT = 1;
var RESIZE_TYPE_DRAGGING = 2;
var RESIZE_TYPE_PRECISE_DRAGGING = 3;
var RESIZE_TYPE_TYPING = 4;

var IMPERIAL_METRIC_MULTIPLIER = 30 / 100;
var COUNTRIES_IMPERIAL_UNITS = ['US'];
var COUNTRIES_LEFT_HAND_TRAFFIC =
    ['AI', 'AG', 'AU', 'BS', 'BD', 'BB', 'BM', 'BT', 'BW', 'BN',
     'KY', 'CX', 'CC', 'CK', 'CY', 'DM', 'TL', 'FK', 'FJ', 'GD', 'GG',
     'GY', 'HK', 'IN', 'ID', 'IE', 'IM', 'JM', 'JP', 'JE', 'KE', 'KI',
     'LS', 'MO', 'MW', 'MY', 'MV', 'MT', 'MU', 'MS', 'MZ', 'NA', 'NR',
     'NP', 'NZ', 'NU', 'NF', 'PK', 'PG', 'PN', 'SH', 'KN', 'LC', 'VC',
     'WS', 'SC', 'SG', 'SB', 'ZA', 'LK', 'SR', 'SZ', 'TZ', 'TH', 'TK',
     'TO', 'TT', 'TC', 'TV', 'UG', 'GB', 'VG', 'VI', 'ZM', 'ZW'];

var WIDTH_INPUT_CONVERSION = [
  { text: 'm', multiplier: 1 / IMPERIAL_METRIC_MULTIPLIER },
  { text: 'cm', multiplier: 1 / 100 / IMPERIAL_METRIC_MULTIPLIER },
  { text: '"', multiplier: 1 / 12 },
  { text: 'inch', multiplier: 1 / 12 },
  { text: 'inches', multiplier: 1 / 12 },
  { text: '\'', multiplier: 1 },
  { text: 'ft', multiplier: 1 },
  { text: 'feet', multiplier: 1 }
];

var SEGMENT_WIDTH_RESOLUTION_IMPERIAL = .25;
var SEGMENT_WIDTH_CLICK_INCREMENT_IMPERIAL = .5;
var SEGMENT_WIDTH_DRAGGING_RESOLUTION_IMPERIAL = .5;

// don't use const because of rounding problems
var SEGMENT_WIDTH_RESOLUTION_METRIC = 1 / 3; // .1 / IMPERIAL_METRIC_MULTIPLER
var SEGMENT_WIDTH_CLICK_INCREMENT_METRIC = 2 / 3; // .2 / IMPERIAL_METRIC_MULTIPLER
var SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC = 2 / 3; // .2 / IMPERIAL_METRIC_MULTIPLER

var MIN_WIDTH_EDIT_CANVAS_WIDTH = 120;
var WIDTH_EDIT_MARGIN = 20;

var NORMALIZE_PRECISION = 5;
var METRIC_PRECISION = 3;
var WIDTH_ROUNDING = .01;

var SEGMENT_WARNING_OUTSIDE = 1;
var SEGMENT_WARNING_WIDTH_TOO_SMALL = 2;
var SEGMENT_WARNING_WIDTH_TOO_LARGE = 3;

var KEY_LEFT_ARROW = 37;
var KEY_RIGHT_ARROW = 39;
var KEY_ENTER = 13;
var KEY_BACKSPACE = 8;
var KEY_DELETE = 46;
var KEY_ESC = 27;
var KEY_D = 68;
var KEY_S = 83;
var KEY_Y = 89;
var KEY_Z = 90;
var KEY_EQUAL = 187; // = or +
var KEY_EQUAL_ALT = 61; // Firefox
var KEY_PLUS_KEYPAD = 107;
var KEY_MINUS = 189;
var KEY_MINUS_ALT = 173; // Firefox
var KEY_MINUS_KEYPAD = 109;
var KEY_SLASH = 191; // slash or question mark

var PRETTIFY_WIDTH_OUTPUT_MARKUP = 1;
var PRETTIFY_WIDTH_OUTPUT_NO_MARKUP = 2;
var PRETTIFY_WIDTH_INPUT = 3;

var SETTINGS_UNITS_IMPERIAL = 1;
var SETTINGS_UNITS_METRIC = 2;

var IMPERIAL_VULGAR_FRACTIONS = {
  '.125': '⅛',
  '.25': '¼',
  '.375': '⅜',
  '.5': '½',
  '.625': '⅝',
  '.75': '¾',
  '.875': '⅞'
};

var CSS_TRANSFORMS = ['webkitTransform', 'MozTransform', 'transform'];

var SEGMENT_OWNER_CAR = 'car';
var SEGMENT_OWNER_BIKE = 'bike';
var SEGMENT_OWNER_PEDESTRIAN = 'pedestrian';
var SEGMENT_OWNER_PUBLIC_TRANSIT = 'public-transit';
var SEGMENT_OWNER_NATURE = 'nature';

var VARIANT_SEPARATOR = '|';

var SEGMENT_OWNERS = {
  'car': {
    owner: SEGMENT_OWNER_CAR,
    imageUrl: '/assets/ui/icons/noun_project_72.svg',
    imageSize: .8
  },
  'public-transit': {
    owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
    imageUrl: '/assets/ui/icons/noun_project_97.svg',
    imageSize: .8
  },
  'bike': {
    owner: SEGMENT_OWNER_BIKE,
    imageUrl: '/assets/ui/icons/noun_project_536.svg',
    imageSize: 1.1
  },
  'pedestrian': {
    owner: SEGMENT_OWNER_PEDESTRIAN,
    imageUrl: '/assets/ui/icons/noun_project_2.svg',
    imageSize: .8
  },
  'nature': {
    owner: SEGMENT_OWNER_NATURE,
    imageUrl: '/assets/ui/icons/noun_project_13130.svg',
    imageSize: .8
  }
};

var VARIANTS = {
  'direction': ['inbound', 'outbound'],
  'parking-lane-direction': ['inbound', 'outbound', 'sideways'],

  'tree-type': ['big', 'palm-tree'],

  'lamp-orientation': ['left', 'both', 'right'],
  'lamp-type': ['modern', 'traditional'],

  'bench-orientation': ['left', 'center', 'right'],
  'turn-lane-orientation': ['left', 'left-straight', 'straight', 'right-straight', 'right',  'both', 'shared'],

  'divider-type': ['median', 'striped-buffer', 'planting-strip',
                   'bush', 'flowers', 'big-tree',
                   'palm-tree', 'bollard', 'dome'],

  'orientation': ['left', 'right'],

  'public-transit-asphalt': ['regular', 'colored'],
  'bike-asphalt': ['regular', 'colored'],

  'transit-shelter-elevation': ['street-level', 'light-rail'],
  'bike-rack-elevation': ['sidewalk-parallel', 'sidewalk', 'road'],

  'car-type': ['car', 'sharrow', 'truck'],
  'sidewalk-density': ['dense', 'normal', 'sparse', 'empty'],

  'parking-lane-orientation': ['left', 'right'],
  'wayfinding-type': ['large', 'medium', 'small']
};

var VARIANT_ICONS = {
  'trashcan': { x: 3, y: 1 },

  'orientation|left': { x: 0, y: 0, title: 'Left' },
  'orientation|right': { x: 1, y: 0, title: 'Right' },
  'turn-lane-orientation|left': { x: 7, y: 1, title: 'Left' },
  'turn-lane-orientation|left-straight': { x: 8, y: 1, title: 'Left and straight' },
  'turn-lane-orientation|straight': { x: 6, y: 1, title: 'Straight' },
  'turn-lane-orientation|right-straight': { x: 9, y: 1, title: 'Right and straight' },
  'turn-lane-orientation|right': { x: 4, y: 1, title: 'Right' },
  'turn-lane-orientation|both': { x: 5, y: 1, title: 'Both' },
  'turn-lane-orientation|shared': { x: 7, y: 0, title: 'Shared' },
  'bench-orientation|left': { x: 4, y: 0, title: 'Left' },
  'bench-orientation|right': { x: 5, y: 0, title: 'Right' },
  'bench-orientation|center': { x: 6, y: 0, title: 'Center' },
  'parking-lane-orientation|left': { x: 0, y: 0, title: 'Left' },
  'parking-lane-orientation|right': { x: 1, y: 0, title: 'Right' },
  'parking-lane-direction|inbound': { x: 2, y: 0, title: 'Inbound' },
  'parking-lane-direction|outbound': { x: 3, y: 0, title: 'Outbound' },
  'parking-lane-direction|sideways': { x: 6, y: 0, title: 'Perpendicular' },
  'direction|inbound': { x: 2, y: 0, title: 'Inbound' },
  'direction|outbound': { x: 3, y: 0, title: 'Outbound' },
  'sidewalk-density|empty': { x: -1, y: 1, title: 'Empty' },
  'sidewalk-density|sparse': { x: 0, y: 1, title: 'Sparse' },
  'sidewalk-density|normal': { x: 1, y: 1, title: 'Normal' },
  'sidewalk-density|dense': { x: 2, y: 1, title: 'Dense' },
  'lamp-orientation|left': { x: 4, y: 0, title: 'Left' },
  'lamp-orientation|both': { x: 6, y: 0, title: 'Both' },
  'lamp-orientation|right': { x: 5, y: 0, title: 'Right' },
  'lamp-type|traditional': { x: 4, y: 2, title: 'Traditional' },
  'lamp-type|modern': { x: 3, y: 2, title: 'Modern' },
  'car-type|car': { x: 0, y: 3, title: 'Car' },
  'car-type|sharrow': { x: 5, y: 3, title: 'Sharrow' },
  'car-type|truck': { x: 1, y: 3, title: 'Truck' },
  'public-transit-asphalt|regular': { x: 2, y: 3, title: '?' },
  'public-transit-asphalt|colored': { x: 3, y: 3, title: '?' },
  'bike-asphalt|regular': { x: 2, y: 3, title: '?' },
  'bike-asphalt|colored': { x: 4, y: 3, title: '?' },
  'tree-type|big': { x: 1, y: 4, title: 'Tree' },
  'tree-type|palm-tree': { x: 0, y: 4, title: 'Palm tree' },
  'divider-type|median': { x: 7, y: 4, title: 'Median' },
  'divider-type|striped-buffer': { x: 8, y: 4, title: 'Striped buffer' },
  'divider-type|planting-strip': { x: 2, y: 4, title: 'Planting strip' },
  'divider-type|bush': { x: 4, y: 4, title: 'Planting strip with a bush' },
  'divider-type|flowers': { x: 5, y: 4, title: 'Planting strip with flowers' },
  'divider-type|big-tree': { x: 1, y: 4, title: 'Planting strip with a tree' },
  'divider-type|palm-tree': { x: 0, y: 4, title: 'Planting strip with a palm tree' },
  'divider-type|bollard': { x: 6, y: 4, title: 'Bollard' },
  'divider-type|dome': { x: 6, y: 3, title: 'Traffic exclusion dome' },
  'transit-shelter-elevation|street-level': { x: 5, y: 2, title: 'Street level' },
  'transit-shelter-elevation|light-rail': { x: 6, y: 2, title: 'Light rail platform' },
  'bike-rack-elevation|sidewalk-parallel': { x: 6, y: 0, title: 'Parallel parking, sidewalk level' },
  'bike-rack-elevation|sidewalk': { x: 6, y: 2, title: 'Perpendicular parking, sidewalk level' },
  'bike-rack-elevation|road': { x: 5, y: 2, title: 'Perpendicular parking, road level' },
  'building|waterfront': { x: 9, y: 4, title: 'Waterfront' },
  'building|grass': { x: 2, y: 4, title: 'Grass' },
  'building|fence': { x: 3, y: 4, title: 'Empty lot' },
  'building|parking-lot': { x: 0, y: 3, title: 'Parking lot' },
  'building|residential': { x: 7, y: 3, title: 'Home' },
  'building|narrow': { x: 7, y: 2, title: 'Narrow building' },
  'building|wide': { x: 8, y: 2, title: 'Wide building' },
  'wayfinding-type|large': { x: 8, y: 3, title: 'Large' },
  'wayfinding-type|medium': { x: 9, y: 3, title: 'Medium' },
  'wayfinding-type|small': { x: 10, y: 3, title: 'Small' }
};

var SEGMENT_INFO = {
  'sidewalk': {
    name: 'Sidewalk',
    owner: SEGMENT_OWNER_PEDESTRIAN,
    zIndex: 2,
    defaultWidth: 6,
    needRandSeed: true,
    variants: ['sidewalk-density'],
    details: {
      'dense': {
        minWidth: 6,
        graphics: {
          center: { tileset: 1, x: 0, y: 0, width: 4, offsetX: -1, height: 1 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
        }
      },
      'normal': {
        minWidth: 6,
        graphics: {
          center: { tileset: 1, x: 0, y: 0, width: 4, offsetX: -1, height: 1 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
        }
      },
      'sparse': {
        minWidth: 6,
        graphics: {
          center: { tileset: 1, x: 0, y: 0, width: 4, offsetX: -1, height: 1 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
        }
      },
      'empty': {
        minWidth: 6,
        graphics: {
          center: { tileset: 1, x: 0, y: 0, width: 4, offsetX: -1, height: 1 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
        }
      }
    }
  },
  'sidewalk-tree': {
    name: 'Sidewalk with a tree',
    owner: SEGMENT_OWNER_NATURE,
    zIndex: 1,
    defaultWidth: 4,
    variants: ['tree-type'],
    details: {
      'big': {
        graphics: {
          center: { tileset: 1, x: 40, y: 56, width: 9, height: 21, offsetY: -10 }, // Big tree
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
        }
      },
      'palm-tree': {
        graphics: {
          center: { tileset: 1, x: 83, y: 24, offsetX: 0, offsetY: -19, width: 14 /* 14 */, height: 31 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
        }
      }
    }
  },
  'sidewalk-bike-rack': {
    name: 'Bike rack',
    owner: SEGMENT_OWNER_BIKE,
    zIndex: 2,
    defaultWidth: 5,
    variants: ['orientation', 'bike-rack-elevation'],
    details: {
      'left|sidewalk-parallel': {
        graphics: {
          left: { tileset: 1, x: 53, y: 12, width: 3, height: 6, offsetY: 5 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
        }
      },
      'right|sidewalk-parallel': {
        graphics: {
          right: { tileset: 1, x: 57, y: 12, width: 3, height: 6, offsetY: 5 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
        }
      },
      'left|sidewalk': {
        graphics: {
          left: { tileset: 1, x: 67, y: 2, width: 6, height: 6, offsetY: 5 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
        }
      },
      'right|sidewalk': {
        graphics: {
          right: { tileset: 1, x: 61, y: 2, width: 6, height: 6, offsetY: 5 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
        }
      },
      'left|road': {
        graphics: {
          left: { tileset: 1, x: 67, y: 12, width: 6, height: 7, offsetY: 5 },
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'right|road': {
        graphics: {
          right: { tileset: 1, x: 61, y: 12, width: 6, height: 7, offsetY: 5 },
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      }
    }
  },

  'sidewalk-bench': {
    name: 'Bench',
    owner: SEGMENT_OWNER_PEDESTRIAN,
    zIndex: 2,
    defaultWidth: 4,
    variants: ['bench-orientation'],
    details: {
      'left': {
        graphics: {
          left: { tileset: 1, x: 81, y: 2, width: 3, height: 6, offsetY: 5 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
        }
      },
      'center': {
        graphics: {
          center: { tileset: 1, x: 74, y: 2, width: 3, height: 6, offsetY: 5 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
        }
      },
      'right': {
        graphics: {
          right: { tileset: 1, x: 78, y: 2, width: 3, height: 6, offsetY: 5 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
        }
      }
    }
  },

  'sidewalk-wayfinding': {
    name: 'Wayfinding sign',
    owner: SEGMENT_OWNER_PEDESTRIAN,
    zIndex: 2,
    defaultWidth: 4,
    variants: ['wayfinding-type'],
    description: {
      prompt: 'Learn more about wayfinding signs',
      image: 'wayfinding-02.jpg',
      imageCaption: '',
      lede: 'Wayfinding signs help pedestrians get to common destinations.',
      text: [
        'Urban planners and architects have spent a few decades trying to learn what happens in people’s brains when they figure out how to get from point A to point B – or how they even know where “point A” is to begin with. As early as 1960, urban planner Kevin Lynch wrote of the “legibility” of the city in his book <em><a href="http://www.amazon.com/Image-Harvard-MIT-Center-Studies-Series/dp/0262620014">The Image of the City</a></em>, describing wayfinding as “a consistent use and organization of definite sensory cues from the external environment.” It could be intangible – smell, touch, a sense of gravity or even electric or magnetic fields. Or it could be much more physical, with intentionally designed “wayfinding devices” like maps, street numbers, or route signs.',
        'It’s surprising how readily acceptable it is for ample signage to cater to car travel, with less of this investment made at the pedestrian level. Maybe it’s because it’s easier for us to stand still, take stock of our surroundings, and use our senses without fear of accidentally causing a six-person pileup behind us. At any rate, urban designers have pushed for pedestrian-friendly wayfinding signage, particularly in walkable commercial neighborhoods, and these signs have become branding opportunities in addition to being functional. So New York City <a href="http://new.pentagram.com/2013/06/new-work-nyc-wayfinding/">hired an internationally renowned design consultant</a> (and Streetmix has modeled its segments after it), many others have adopted a traditional old-town or civic-formal take (pictured above), and then there are those, for whatever reason, who lack any pedestrian wayfinding signage of significance, such that any improvement must be made with <a href="http://walkyourcity.org/">guerrilla wayfinding tactics</a>.',
        'After all, there’s nothing worse than being lost. As Lynch wrote: “The very word <em>lost</em> in our language means much more than simple geographical uncertainty; it carries overtones of utter disaster.” And who wants to be on the street feeling like that?'
      ]
    },
    details: {
      'large': {
        graphics: {
          center: { tileset: 1, x: 0, y: 0, width: 4, height: 11, offsetY: 1 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 } // Concrete
        }
      },
      'medium': {
        graphics: {
          center: { tileset: 1, x: 5, y: 0, width: 3, height: 11, offsetY: 1 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 } // Concrete
        }
      },
      'small': {
        graphics: {
          center: { tileset: 1, x: 9, y: 0, width: 2, height: 11, offsetY: 1 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 } // Concrete
        }
      }
    }
  },

  'sidewalk-lamp': {
    name: 'Sidewalk with a lamp',
    owner: SEGMENT_OWNER_PEDESTRIAN,
    zIndex: 2,
    defaultWidth: 4,
    variants: ['lamp-orientation', 'lamp-type'],
    details: {
      'right|modern': {
        graphics: {
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }, // Concrete
          right: { tileset: 1, x: 56, y: 24, offsetX: -10, offsetY: -19, width: 12, height: 31 }
        }
      },
      'both|modern': {
        graphics: {
          center: { tileset: 1, x: 39, y: 24, offsetY: -19, width: 16, height: 31 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
        }
      },
      'left|modern': {
        graphics: {
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
          left: { tileset: 1, x: 70, y: 24, offsetX: -10, offsetY: -19, width: 12, height: 31 }
        }
      },
      'right|traditional': {
        graphics: {
          right: { tileset: 3, x: 201, y: 49, width: 4, height: 15, offsetX: -2, offsetY: -4 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 } // Concrete
        }
      },
      'both|traditional': {
        graphics: {
          center: { tileset: 3, x: 194, y: 49, width: 3, height: 15, offsetY: -4 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 } // Concrete
        }
      },
      'left|traditional': {
        graphics: {
          left: { tileset: 3, x: 197, y: 49, width: 3, height: 15, offsetY: -4, offsetX: -2 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 } // Concrete
        }
      }
    }
  },
  'parklet': {
    name: 'Parklet',
    owner: SEGMENT_OWNER_NATURE,
    zIndex: 2,
    defaultWidth: 8,
    variants: ['orientation'],
    description: {
      prompt: 'Learn more about parklets',
      image: 'parklets-01.jpg',
      imageCaption: '4033 Judah Street Parklet, courtesy of San Francisco Planning Department.',
      lede: 'Parklets turn existing parking spots into temporary public spaces.',
      text: [
        'In 2005, San Francisco-based design studio <a href="http://rebargroup.org/">Rebar</a> temporarily converted a single metered parking space on downtown Mission Street into a tiny public park. The first parklet was simple: just a bench and a tree on a rectangular piece of turf, but it featured a brief instruction manual and a charge for others to make their own. With people realizing that so much of public space was really devoted to storing cars, an international movement was born, and now, the annual <a href="http://parkingday.org/">Park(ing) Day</a> hosts nearly a thousand temporarily converted spots around the world.',
        'Knowing a good idea when it sees one, San Francisco became the first city to make parklets official with its <a href="http://sfpavementtoparks.sfplanning.org/">Pavement to Parks program</a> in 2010. Today, the City by the Bay has over 50 parklets, many of which are now architecturally designed objects much improved beyond Rebar’s modest prototype. There’s an ambitious, corporate-sponsored two-block-long parklet in the heart of San Francisco’s busiest shopping corridor, and also a collection of movable, bright red “parkmobiles” (Streetmix’s default look) designed for the <a href="http://www.ybcbd.org/">Yerba Buena Community Benefit District</a>. Official parklet programs now exist in many other cities in North America, such as Philadelphia, Oakland, Kansas City, New York, Chicago, and Vancouver, and many more cities are soon to follow.'
      ]
    },
    details: {
      'left': {
        minWidth: 8,
        graphics: {
          left: { tileset: 2, x: 136 - 20, y: 63 - 29, width: 8, height: 8, offsetY: 4 },
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'right': {
        minWidth: 8,
        graphics: {
          right: { tileset: 2, x: 126 - 20, y: 63 - 29, width: 8, height: 8, offsetY: 4 },
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      }
    }
  },
  'divider': {
    name: 'Buffer',
    owner: SEGMENT_OWNER_NATURE,
    zIndex: 1,
    defaultWidth: 2,
    variants: ['divider-type'],
    details: {
      'median': {
        name: 'Median',
        graphics: {
          repeat: [
            { tileset: 2, x: 98, y: 43, width: 10, height: 6, offsetY: 9 }, // Median
            { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
          ]
        }
      },
      'striped-buffer': {
        name: 'Buffer',
        graphics: {
          repeat: [
            { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
            { tileset: 2, x: 116, y: 21, width: 5, height: 5, offsetY: 10 } // Asphalt
          ],
          left: { tileset: 2, x: 119, y: 15, width: 1, height: 5, offsetY: 10 }, // Marking
          right: { tileset: 2, x: 117, y: 15, width: 1, height: 5, offsetY: 10 } // Marking
        }
      },
      'planting-strip': {
        name: 'Planting strip',
        graphics: {
          repeat: [
            { tileset: 2, x: 121, y: 53, width: 4, height: 5, offsetY: 10, offsetLeft: 0, offsetRight: 0 },
            { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
          ]
        }
      },
      'bush': {
        name: 'Planting strip',
        graphics: {
          center: { tileset: 2, x: 122, y: 55, width: 2, height: 5, offsetY: 7 },
          repeat: [
            { tileset: 2, x: 121, y: 53, width: 4, height: 5, offsetY: 10, offsetLeft: 0, offsetRight: 0 },
            { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
          ]
        }
      },
      'flowers': {
        name: 'Planting strip',
        graphics: {
          center: { tileset: 2, x: 122, y: 59, width: 2, height: 5, offsetY: 7 },
          repeat: [
            { tileset: 2, x: 121, y: 53, width: 4, height: 5, offsetY: 10, offsetLeft: 0, offsetRight: 0 },
            { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
          ]
        }
      },
      'big-tree': {
        name: 'Planting strip',
        graphics: {
          center: { tileset: 1, x: 40, y: 56, width: 9, height: 21, offsetY: -10 }, // Big tree
          repeat: [
            { tileset: 2, x: 121, y: 53, width: 4, height: 5, offsetY: 10, offsetLeft: 0, offsetRight: 0 },
            { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
          ]
        }
      },
      'palm-tree': {
        name: 'Planting strip',
        graphics: {
          center: { tileset: 1, x: 83, y: 24, offsetX: 0, offsetY: -19, width: 14 /* 14 */, height: 31 },
          repeat: [
            { tileset: 2, x: 121, y: 53, width: 4, height: 5, offsetY: 10, offsetLeft: 0, offsetRight: 0 },
            { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }
          ]
        }
      },
      'bollard': {
        name: 'Bollard',
        graphics: {
          center: { tileset: 2, x: 123, y: 64, width: 1, height: 7, offsetY: 5 },
          repeat: [
            { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
          ]
        }
      },
      'dome': {
        name: 'Traffic exclusion dome',
        graphics: {
          center: { tileset: 2, x: 121, y: 64, width: 1, height: 7, offsetY: 5 },
          repeat: [
            { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
          ]
        }
      }
    }
  },
  'bike-lane': {
    name: 'Bike lane',
    owner: SEGMENT_OWNER_BIKE,
    zIndex: 2,
    defaultWidth: 6,
    variants: ['direction', 'bike-asphalt'],
    description: {
      prompt: 'Learn more about bike lanes',
      image: 'bike-lane-02.jpg',
      imageCaption: '',
      lede: 'Bike lanes help keep bicyclists safe in a separate lane from cars.',
      text: [
        'On the historical timeline of personal transportation vehicles – horses on one end, and, say, Segways on the other – automobiles and bicycles have been the dominant warring tribes of public streets for nearly a century. Despite all the cars taking up so much room, though, there’s more bicycles than anything else in the world: more than a billion, as estimated by Worldometers, and nine million in Beijing, according to folk singer <a href="http://en.wikipedia.org/wiki/Nine_Million_Bicycles">Katie Melua</a>, where bicycling accounts for 32% of all trips.',
        'While most jurisdictions allow bicycles to share the road with motor vehicles (“A person riding a bicycle… has all the rights and is subject to all the provisions applicable to the driver of a vehicle” <a href="http://www.leginfo.ca.gov/cgi-bin/displaycode?section=veh&group=21001-22000&file=21200-21212">says the California Vehicle Code</a>, in one particular instance) it goes without saying that most cyclists prefer to be in their own lane. It’s safer, for one thing. And because it’s safer, it actually encourages more bikers. And more bikers means healthier citizens, reduced carbon emissions, higher traffic throughput, and congestion mitigation. The <a href="http://pdxcityclub.org/2013/Report/Portland-Bicycle-Transit/Economic-Effects-of-Increased-Bicycle-Usage">economic benefits accrue as well</a>: less money spent on automobile infrastructure (like bridges, roadways, and parking), and with the ability to fit more people on a road, it leads to more business in commercial corridors.',
        'Bike lane design can be extremely varied. Using medians, planters, bollards, or even parking lanes create better protection between bikes and cars. When lanes are painted green, it shows their city’s commitment to a continuous bike lane, and synchronized signal light timing to limit bike stops are called a “green wave.” For more information, check out the <a href="http://nacto.org/cities-for-cycling/design-guide/">NACTO Urban Bikeway Design Guide</a>.'
      ]
    },
    details: {
      'inbound|regular': {
        minWidth: 5,
        graphics: {
          center: [
            { tileset: 1, x: 5, y: 30 + 19, width: 3, height: 8, offsetY: 4 },
            { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (inbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'outbound|regular': {
        minWidth: 5,
        graphics: {
          center: [
            { tileset: 1, x: 9, y: 30 + 19, width: 3, height: 8, offsetY: 4 },
            { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'inbound|colored': {
        description: {
          prompt: 'Learn more about colored bike lanes',
          image: 'bike-lane-colored-01.jpg',
          imageCaption: '',
          lede: 'Colored bike lanes are more visible and safer for bicyclists.',
          text: [
            'As bicycling for day-to-day transportation becomes more widespread, planners need to ensure the safety of cyclists, eliminate collisions between bikes and cars, and prevent cars from illegally taking up space designated for bikes. The problem: motorists aren’t always completely aware of cyclists. The solution: make cyclists as visible as possible. And one strategy for this is to make bike lanes a totally different color than the rest of the asphalt.',
            'Although the safety benefits for colored bike lanes have been proven in <a href="http://greenlaneproject.org/stats/#safety">numerous studies</a>, everyone’s got an opinion on <em>which</em> color to use: the Netherlands uses red lanes, Denmark uses blue, and France uses green. The United Kingdom has a mixture of red and green, and most municipalities in the United States ended up going green (by accident: they all just copied each other), though Portland, one of the most bike-friendly cities in the U.S., have been using <a href="http://www.portlandoregon.gov/transportation/article/58842">blue lanes since the 1990s</a>.',
            'No matter which color you like best, the general rule of thumb is to pick something that sticks out and doesn’t look like other lane markings in your area. Beyond that, the more pressing budgetary concern for most cities is maintenance. Right now, the most commonly used type of paint dulls and wears off fairly quickly, although new improvements in paint are starting to make it more durable. But if recurring costs are a significant concern, don’t let that outweigh the safety benefits: you might want to consider an up-front cost in the form of <a href="http://nacto.org/bufferedlane.html‎">protective barriers</a>, instead.'
          ]
        },
        minWidth: 5,
        graphics: {
          center: [
            { tileset: 1, x: 5, y: 30 + 19, width: 3, height: 8, offsetY: 4 },
            { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (inbound)
          ],
          repeat: { tileset: 2, x: 98 - 10, y: 53 + 10, width: 8, height: 5, offsetY: 10 } // Green asphalt
        }
      },
      'outbound|colored': {
        description: {
          prompt: 'Learn more about colored bike lanes',
          image: 'bike-lane-colored-01.jpg',
          imageCaption: '',
          lede: 'Colored bike lanes are more visible and safer for bicyclists.',
          text: [
            'As bicycling for day-to-day transportation becomes more widespread, planners need to ensure the safety of cyclists, eliminate collisions between bikes and cars, and prevent cars from illegally taking up space designated for bikes. The problem: motorists aren’t always completely aware of cyclists. The solution: make cyclists as visible as possible. And one strategy for this is to make bike lanes a totally different color than the rest of the asphalt.',
            'Although the safety benefits for colored bike lanes have been proven in <a href="http://greenlaneproject.org/stats/#safety">numerous studies</a>, everyone’s got an opinion on <em>which</em> color to use: the Netherlands uses red lanes, Denmark uses blue, and France uses green. The United Kingdom has a mixture of red and green, and most municipalities in the United States ended up going green (by accident: they all just copied each other), though Portland, one of the most bike-friendly cities in the U.S., have been using <a href="http://www.portlandoregon.gov/transportation/article/58842">blue lanes since the 1990s</a>.',
            'No matter which color you like best, the general rule of thumb is to pick something that sticks out and doesn’t look like other lane markings in your area. Beyond that, the more pressing budgetary concern for most cities is maintenance. Right now, the most commonly used type of paint dulls and wears off fairly quickly, although new improvements in paint are starting to make it more durable. But if recurring costs are a significant concern, don’t let that outweigh the safety benefits: you might want to consider an up-front cost in the form of <a href="http://nacto.org/bufferedlane.html‎">protective barriers</a>, instead.'
          ]
        },
        minWidth: 5,
        graphics: {
          center: [
            { tileset: 1, x: 9, y: 30 + 19, width: 3, height: 8, offsetY: 4 },
            { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (outbound)
          ],
          repeat: { tileset: 2, x: 98 - 10, y: 53 + 10, width: 8, height: 5, offsetY: 10 } // Green asphalt
        }
      }
    }
  },
  'drive-lane': {
    name: 'Drive lane',
    owner: SEGMENT_OWNER_CAR,
    zIndex: 2,
    defaultWidth: 10,
    variants: ['direction', 'car-type'],
    details: {
      'inbound|car': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 1, x: 8, y: 27, width: 8, height: 15 }, // Car (inbound)
            { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (inbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'outbound|car': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 1, x: 0, y: 27, width: 8, height: 15 }, // Car (outbound)
            { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'inbound|sharrow': {
        name: 'Sharrow',
        minWidth: 12,
        maxWidth: 14,
        defaultWidth: 14,
        description: {
          prompt: 'Learn more about sharrows',
          image: 'sharrow-01.jpg',
          imageCaption: '',
          lede: 'Sharrows are marked travel lanes shared by both cars and bikes.',
          text: [
            'Officially known in transportation planning as “shared lane marking,” sharrows (a portmanteau of “shared” and “arrow”) refer to the arrow markings themselves, but aren’t actually a different <em>type</em> of lane. In many places, bicycles are already allowed on any street meant for cars, and are bound by the same laws.',
            'That being said, it doesn’t take a rocket scientist to see that cars and bikes behave very differently, and so separate bike lanes are <a href="http://dc.streetsblog.org/2013/06/13/in-california-cities-drivers-want-more-bike-lanes-heres-why/">much more preferable</a> for both the safety of cyclists and the sanity of car drivers. But for many cyclists, when there’s not enough road space for those bike lanes, the argument is that sharrows are better than nothing else at all. Motorists tend to forget there are other types of vehicles, and cyclists appreciate any opportunity to remind motorists that they exist and must coexist peacefully together. And giving cyclists more leeway to use the full width of a lane can also protect them from parked cars, in a particular type of accident cyclists call “getting doored.”',
            'Sharrow markings are a simple way to provide more visibility to bicyclists, since paint is cheaper than building a dedicated bike lane, and more politically feasible. However, some research on safety (such as a <a href="http://injuryprevention.bmj.com/content/early/2013/02/13/injuryprev-2012-040561.full.pdf">2012 BMJ study</a> of bicycle injuries in Vancouver and Toronto) indicate that there were slightly increased odds of injury in a shared lane, compared to those in a dedicated bike lane. The moral of the story is, take care of bicyclists by trying to put in a normal bike lane first before resorting to sharrows.'
          ]
        },
        graphics: {
          center: [
            { tileset: 1, x: 8, y: 27, width: 8, height: 15 }, // Car (inbound)
            { tileset: 1, x: 5, y: 10 + 30 + 19, width: 3, height: 8, offsetY: 4 }, // Bike (inbound)
            { tileset: 2, x: 101, y: 15, width: 4, height: 5, offsetY: 10 } // Sharrow arrow
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'outbound|sharrow': {
        name: 'Sharrow',
        minWidth: 12,
        maxWidth: 14,
        defaultWidth: 14,
        description: {
          prompt: 'Learn more about sharrows',
          image: 'sharrow-01.jpg',
          imageCaption: '',
          lede: 'Sharrows are marked travel lanes shared by both cars and bikes.',
          text: [
            'Officially known in transportation planning as “shared lane marking,” sharrows (a portmanteau of “shared” and “arrow”) refer to the arrow markings themselves, but aren’t actually a different <em>type</em> of lane. In many places, bicycles are already allowed on any street meant for cars, and are bound by the same laws.',
            'That being said, it doesn’t take a rocket scientist to see that cars and bikes behave very differently, and so separate bike lanes are <a href="http://dc.streetsblog.org/2013/06/13/in-california-cities-drivers-want-more-bike-lanes-heres-why/">much more preferable</a> for both the safety of cyclists and the sanity of car drivers. But for many cyclists, when there’s not enough road space for those bike lanes, the argument is that sharrows are better than nothing else at all. Motorists tend to forget there are other types of vehicles, and cyclists appreciate any opportunity to remind motorists that they exist and must coexist peacefully together. And giving cyclists more leeway to use the full width of a lane can also protect them from parked cars, in a particular type of accident cyclists call “getting doored.”',
            'Sharrow markings are a simple way to provide more visibility to bicyclists, since paint is cheaper than building a dedicated bike lane, and more politically feasible. However, some research on safety (such as a <a href="http://injuryprevention.bmj.com/content/early/2013/02/13/injuryprev-2012-040561.full.pdf">2012 BMJ study</a> of bicycle injuries in Vancouver and Toronto) indicate that there were slightly increased odds of injury in a shared lane, compared to those in a dedicated bike lane. The moral of the story is, take care of bicyclists by trying to put in a normal bike lane first before resorting to sharrows.'
          ]
        },
        graphics: {
          center: [
            { tileset: 1, x: 0, y: 27, width: 8, height: 15 }, // Car (outbound)
            { tileset: 1, x: 9, y: 10 + 30 + 19, width: 3, height: 8, offsetY: 4 }, // Bike (outbound)
            { tileset: 2, x: 106, y: 15, width: 4, height: 5, offsetY: 10 } // Sharrow arrow
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'inbound|truck': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 1, x: 17, y: 64, width: 10, height: 12, offsetY: 0 }, // Truck (inbound)
            { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (inbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'outbound|truck': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 1, x: 29, y: 64, width: 9, height: 12, offsetY: 0 }, // Truck (outbound)
            { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      }
    }
  },
  'turn-lane': {
    name: 'Turn lane',
    owner: SEGMENT_OWNER_CAR,
    zIndex: 2,
    defaultWidth: 10,
    variants: ['direction', 'turn-lane-orientation'],
    details: {
      'inbound|left': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 1, x: 20, y: 78, width: 8, height: 6, offsetY: 6 }, // Car (outbound)
            { tileset: 2, x: 125, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'inbound|left-straight': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 2, x: 125, y: 10, width: 4, height: 5, offsetY: 10 }, // Arrow
            { tileset: 1, x: 20, y: 78, width: 8, height: 6, offsetY: 6 } // Car (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'inbound|straight': {
        name: 'No turn lane',
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 1, x: 8, y: 27, width: 8, height: 15 }, // Car (inbound)
            { tileset: 1, x: 30, y: 5, width: 4, height: 5, offsetY: 10 } // Arrow (inbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'inbound|right-straight': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 1, x: 83, y: 10, width: 4, height: 5, offsetY: 10 }, // Arrow
            { tileset: 1, x: 29, y: 78, width: 8, height: 6, offsetY: 6 } // Car (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'inbound|right': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 1, x: 83, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow
            { tileset: 1, x: 29, y: 78, width: 8, height: 6, offsetY: 6 } // Car (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'inbound|both': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 2, x: 153, y: 15, width: 5, height: 5, offsetY: 10 }, // Arrow
            { tileset: 1, x: 20, y: 78, width: 8, height: 6, offsetY: 6 } // Car (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'inbound|shared': {
        name: 'Center turn lane',
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 2, x: 144, y: 20, width: 5, height: 5, offsetY: 10 } // Arrow
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          left: { tileset: 2, x: 119, y: 10, width: 2, height: 5, offsetY: 10 }, // Marking
          right: { tileset: 2, x: 116, y: 10, width: 2, height: 5, offsetY: 10 } // Marking
        }
      },
      'outbound|left': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 2, x: 134, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow
            { tileset: 1, x: 1, y: 78, width: 8, height: 6, offsetY: 6 } // Car (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'outbound|left-straight': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 2, x: 134, y: 10, width: 4, height: 5, offsetY: 10 }, // Arrow
            { tileset: 1, x: 1, y: 78, width: 8, height: 6, offsetY: 6 } // Car (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'outbound|straight': {
        name: 'No turn lane',
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 1, x: 0, y: 27, width: 8, height: 15 }, // Car (outbound)
            { tileset: 1, x: 39, y: 5, width: 4, height: 5, offsetY: 10 } // Arrow (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'outbound|right-straight': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 2, x: 143, y: 10, width: 4, height: 5, offsetY: 10 }, // Arrow
            { tileset: 1, x: 10, y: 78, width: 8, height: 6, offsetY: 6 } // Car (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'outbound|right': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 2, x: 143, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow
            { tileset: 1, x: 10, y: 78, width: 8, height: 6, offsetY: 6 } // Car (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'outbound|both': {
        minWidth: 9,
        maxWidth: 12,
        graphics: {
          center: [
            { tileset: 2, x: 148, y: 15, width: 5, height: 5, offsetY: 10 }, // Arrow
            { tileset: 1, x: 1, y: 78, width: 8, height: 6, offsetY: 6 } // Car (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'outbound|shared': {
        name: 'Center turn lane',
        minWidth: 10,
        maxWidth: 16,
        defaultWidth: 12,
        graphics: {
          center: [
            { tileset: 2, x: 134, y: 20, width: 5, height: 5, offsetY: 10 } // Arrow
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          left: { tileset: 2, x: 119, y: 10, width: 2, height: 5, offsetY: 10 }, // Marking
          right: { tileset: 2, x: 116, y: 10, width: 2, height: 5, offsetY: 10 } // Marking
        }
      }
    }
  },
  'parking-lane': {
    name: 'Parking lane',
    owner: SEGMENT_OWNER_CAR,
    zIndex: 2,
    defaultWidth: 8,
    variants: ['parking-lane-direction', 'parking-lane-orientation'],
    details: {
      'inbound|left': {
        minWidth: 7,
        maxWidth: 10,
        graphics: {
          center: [
            { tileset: 1, x: 8, y: 27, width: 8, height: 15 } // Car (inbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          right: { tileset: 2, x: 112, y: 15, width: 2, height: 5, offsetY: 10 } // Parking marking
        }
      },
      'inbound|right': {
        minWidth: 7,
        maxWidth: 10,
        graphics: {
          center: [
            { tileset: 1, x: 8, y: 27, width: 8, height: 15 } // Car (inbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          left: { tileset: 1, x: 46, y: 15, width: 2, height: 5, offsetY: 10 } // Parking marking
        }
      },
      'outbound|left': {
        minWidth: 7,
        maxWidth: 10,
        graphics: {
          center: [
            { tileset: 1, x: 0, y: 27, width: 8, height: 15 } // Car (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          right: { tileset: 2, x: 112, y: 15, width: 2, height: 5, offsetY: 10 } // Parking marking
        }
      },
      'outbound|right': {
        minWidth: 7,
        maxWidth: 10,
        graphics: {
          center: [
            { tileset: 1, x: 0, y: 27, width: 8, height: 15 } // Car (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          left: { tileset: 1, x: 46, y: 15, width: 2, height: 5, offsetY: 10 } // Parking marking
        }
      },
      'sideways|left': {
        name: 'Perpendicular parking',
        minWidth: 14,
        maxWidth: 20,
        graphics: {
          left: [
            { tileset: 1, x: 38, y: 78, width: 14, height: 6, offsetY: 6 } // Car (side)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'sideways|right': {
        name: 'Perpendicular parking',
        minWidth: 14,
        maxWidth: 20,
        graphics: {
          right: [
            { tileset: 1, x: 54, y: 78, width: 14, height: 6, offsetY: 6 } // Car (side)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      }
    }
  },
  'bus-lane': {
    name: 'Bus lane',
    owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
    zIndex: 2,
    defaultWidth: 12,
    variants: ['direction', 'public-transit-asphalt'],
    details: {
      'inbound|regular': {
        minWidth: 10,
        maxWidth: 13,
        graphics: {
          center: [
            { tileset: 1, x: 28, y: 27, width: 11, height: 13 }, // Bus
            { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (inbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'outbound|regular': {
        minWidth: 10,
        maxWidth: 13,
        graphics: {
          center: [
            { tileset: 1, x: 16, y: 27, width: 12, height: 13 }, // Bus
            { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'inbound|colored': {
        minWidth: 10,
        maxWidth: 13,
        graphics: {
          center: [
            { tileset: 1, x: 28, y: 27, width: 11, height: 13 }, // Bus
            { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (inbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53 + 10, width: 10, height: 5, offsetY: 10 } // Red asphalt
        }
      },
      'outbound|colored': {
        minWidth: 10,
        maxWidth: 13,
        graphics: {
          center: [
            { tileset: 1, x: 16, y: 27, width: 12, height: 13 }, // Bus
            { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53 + 10, width: 10, height: 5, offsetY: 10 } // Red asphalt
        }
      }
    }
  },
  'streetcar': {
    name: 'Streetcar',
    owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
    zIndex: 2,
    defaultWidth: 12,
    variants: ['direction', 'public-transit-asphalt'],
    details: {
      'inbound|regular': {
        minWidth: 10,
        maxWidth: 14,
        graphics: {
          center: [
            { tileset: 1, x: 28, y: 57, width: 8, height: 5, offsetY: 10 }, // Track
            { tileset: 3, x: 192, y: 0, width: 12, height: 18, offsetY: -2 }, // Streetcar
            { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (inbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'outbound|regular': {
        minWidth: 10,
        maxWidth: 14,
        graphics: {
          center: [
            { tileset: 1, x: 28, y: 57, width: 8, height: 5, offsetY: 10 }, // Track
            { tileset: 3, x: 204, y: 0, width: 12, height: 18, offsetY: -2 }, // Streetcar
            { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      },
      'inbound|colored': {
        minWidth: 10,
        maxWidth: 14,
        graphics: {
          center: [
            { tileset: 1, x: 18, y: 57, width: 8, height: 5, offsetY: 10 }, // Track
            { tileset: 3, x: 192, y: 0, width: 12, height: 18, offsetY: -2 }, // Streetcar
            { tileset: 1, x: 29, y: 15, width: 4, height: 5, offsetX: 1, offsetY: 10 } // Dark arrow (inbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53 + 10, width: 10, height: 5, offsetY: 10 } // Red asphalt
        }
      },
      'outbound|colored': {
        minWidth: 10,
        maxWidth: 14,
        graphics: {
          center: [
            { tileset: 1, x: 18, y: 57, width: 8, height: 5, offsetY: 10 }, // Track
            { tileset: 3, x: 204, y: 0, width: 12, height: 18, offsetY: -2 }, // Streetcar
            { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 } // Dark arrow (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53 + 10, width: 10, height: 5, offsetY: 10 } // Red asphalt
        }
      }
    }
  },
  'light-rail': {
    name: 'Light rail',
    owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
    zIndex: 2,
    defaultWidth: 12,
    variants: ['direction', 'public-transit-asphalt'],
    details: {
      'inbound|regular': {
        minWidth: 10,
        maxWidth: 14,
        graphics: {
          center: [
            { tileset: 1, x: 17, y: 40, width: 10, height: 17, offsetY: -5 }, // Light rail
            { tileset: 1, x: 18, y: 57, width: 8, height: 5, offsetY: 10 }, // Track
            { tileset: 1, x: 28, y: 15, width: 8, height: 5, offsetY: 10 } // Dark arrow (inbound)
          ],
          repeat: { tileset: 2, x: 110, y: 43, width: 9, height: 5, offsetY: 10 } // Lower concrete
        }
      },
      'outbound|regular': {
        minWidth: 10,
        maxWidth: 14,
        graphics: {
          center: [
            { tileset: 1, x: 27, y: 40, width: 10, height: 17, offsetY: -5 }, // Light rail
            { tileset: 1, x: 18, y: 57, width: 8, height: 5, offsetY: 10 }, // Track
            { tileset: 1, x: 37, y: 15, width: 8, height: 5, offsetY: 10 } // Dark arrow (outbound)
          ],
          repeat: { tileset: 2, x: 110, y: 43, width: 9, height: 5, offsetY: 10 } // Lower concrete
        }
      },
      'inbound|colored': {
        minWidth: 10,
        maxWidth: 14,
        graphics: {
          center: [
            { tileset: 1, x: 17, y: 40, width: 10, height: 17, offsetY: -5 }, // Light rail
            { tileset: 1, x: 18, y: 57, width: 8, height: 5, offsetY: 10 }, // Track
            { tileset: 1, x: 28, y: 15, width: 8, height: 5, offsetY: 10 } // Dark arrow (inbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53 + 10, width: 10, height: 5, offsetY: 10 } // Red asphalt
        }
      },
      'outbound|colored': {
        minWidth: 10,
        maxWidth: 14,
        graphics: {
          center: [
            { tileset: 1, x: 27, y: 40, width: 10, height: 17, offsetY: -5 }, // Light rail
            { tileset: 1, x: 18, y: 57, width: 8, height: 5, offsetY: 10 }, // Track
            { tileset: 1, x: 37, y: 15, width: 8, height: 5, offsetY: 10 } // Dark arrow (outbound)
          ],
          repeat: { tileset: 2, x: 98, y: 53 + 10, width: 10, height: 5, offsetY: 10 } // Red asphalt
        }
      }
    }
  },
  'transit-shelter': {
    name: 'Transit shelter',
    owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
    zIndex: 2,
    defaultWidth: 9,
    variants: ['orientation', 'transit-shelter-elevation'],
    details: {
      'left|street-level': {
        minWidth: 9,
        graphics: {
          left: { tileset: 3, x: 171, y: 1, width: 9, height: 12, offsetY: -1 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 } // Concrete
        }
      },
      'right|street-level': {
        minWidth: 9,
        graphics: {
          right: { tileset: 3, x: 181, y: 1, width: 9, height: 12, offsetY: -1 },
          repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 } // Concrete
        }
      },
      'left|light-rail': {
        minWidth: 8,
        description: {
          prompt: 'Learn more about elevated transit shelters',
          image: 'transit-station-elevated.jpg',
          imageCaption: '',
          lede: 'Elevated shelters serve light rail and bus rapid transit stops.',
          text: [
            'For some light rail systems, and bus rapid transit (BRT) systems where speed of service is a huge priority, an elevated shelter does the trick. It allows patrons to board at the same level as the bus, which speeds up the boarding process (especially for wheelchairs and others with access needs) and shaves crucial seconds off the routes time, all of which add up over time.',
            'Because of this focus on efficiency, transit vehicles that use elevated platforms are also usually in their own dedicated lanes, so these platforms are placed where they can access these lanes easily, usually in the median.  If placed inbetween lanes going in opposite directions, they can easily serve passengers on both sides of the platform (and you’ll need to place two of them in Streetmix).',
            'Elevated shelters are also sometimes designed like heavy rail train stations, enclosed or with a roof to protect passengers from the elements, and are handy visual beacons of public transit on a busy boulevard. But compared with shelters that are at curb height, they tend to be more expensive pieces of infrastructure and take up more space with of wheelchair ramps. This makes it more difficult for BRT services to be provided with as much flexibility as a normal bus service. Furthermore, with low-floor buses becoming increasingly more common, it starts to reduce the need to have higher platforms.'
          ]
        },
        graphics: {
          left: { tileset: 3, x: 171, y: 51, width: 9, height: 12, offsetY: -3 },
          repeat: { tileset: 2, x: 110, y: 63, width: 9, height: 9, offsetY: 6 } // Raised concrete
        }
      },
      'right|light-rail': {
        minWidth: 8,
        description: {
          prompt: 'Learn more about elevated transit shelters',
          image: 'transit-station-elevated.jpg',
          imageCaption: '',
          lede: 'Elevated shelters serve light rail and bus rapid transit stops.',
          text: [
            'For some light rail systems, and bus rapid transit (BRT) systems where speed of service is a huge priority, an elevated shelter does the trick. It allows patrons to board at the same level as the bus, which speeds up the boarding process (especially for wheelchairs and others with access needs) and shaves crucial seconds off the routes time, all of which add up over time.',
            'Because of this focus on efficiency, transit vehicles that use elevated platforms are also usually in their own dedicated lanes, so these platforms are placed where they can access these lanes easily, usually in the median.  If placed inbetween lanes going in opposite directions, they can easily serve passengers on both sides of the platform (and you’ll need to place two of them in Streetmix).',
            'Elevated shelters are also sometimes designed like heavy rail train stations, enclosed or with a roof to protect passengers from the elements, and are handy visual beacons of public transit on a busy boulevard. But compared with shelters that are at curb height, they tend to be more expensive pieces of infrastructure and take up more space with of wheelchair ramps. This makes it more difficult for BRT services to be provided with as much flexibility as a normal bus service. Furthermore, with low-floor buses becoming increasingly more common, it starts to reduce the need to have higher platforms.'
          ]
        },
        graphics: {
          right: { tileset: 3, x: 181, y: 51, width: 9, height: 13, offsetY: -3 },
          repeat: { tileset: 2, x: 110, y: 63, width: 9, height: 9, offsetY: 6 } // Raised concrete
        }
      }
    }
  },
  'train': {
    name: '“Inception” train',
    owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
    zIndex: 1,
    defaultWidth: 14,
    variants: [''],
    secret: true,
    description: {
      image: 'train.jpg',
      imageCaption: '',
      lede: 'It’s the train from the Christopher Nolan movie <em>Inception.</em>',
      text: [
        'What more do you need to know?'
      ]
    },
    details: {
      '': {
        minWidth: 14,
        graphics: {
          center: { tileset: 1, x: 82, y: 68, width: 14, height: 16, offsetY: -4 },
          repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
        }
      }
    }
  }
};

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

var USER_ID_COOKIE = 'user_id';
var SIGN_IN_TOKEN_COOKIE = 'login_token';

var LOCAL_STORAGE_SETTINGS_ID = 'settings';
var LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED = 'settings-welcome-dismissed';
var LOCAL_STORAGE_SIGN_IN_ID = 'sign-in';
var LOCAL_STORAGE_FEEDBACK_BACKUP = 'feedback-backup';
var LOCAL_STORAGE_FEEDBACK_EMAIL_BACKUP = 'feedback-email-backup';

var INFO_BUBBLE_MARGIN_BUBBLE = 20;
var INFO_BUBBLE_MARGIN_MOUSE = 10;

var PERSON_TYPES = 31;
var PERSON_CAN_GO_FIRST = [true, true, true, true, true, true, true, true, true, true,
                           true, true, true, true, true, true, true, true, false, false,
                           true, true, true, true, true, true, true, true, true, true,
                           true];
var PERSON_WIDTH = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
                    2, 2, 2, 3, 2, 3, 3, 3, 3, 3,
                    1, 1, 3, 4, 2, 3, 2, 3, 4, 3,
                    2];
var PERSON_TILESET_WRAP = 10;

var INFO_BUBBLE_TYPE_SEGMENT = 1;
var INFO_BUBBLE_TYPE_LEFT_BUILDING = 2;
var INFO_BUBBLE_TYPE_RIGHT_BUILDING = 3;

var MAX_RAND_SEED = 999999999;

var TRACK_CATEGORY_INTERACTION = 'Interaction';
var TRACK_CATEGORY_SHARING = 'Sharing';
var TRACK_CATEGORY_EVENT = 'Event';
var TRACK_CATEGORY_ERROR = 'Error';

var TRACK_ACTION_LEARN_MORE = 'Learn more about segment';
var TRACK_ACTION_FACEBOOK = 'Facebook';
var TRACK_ACTION_TWITTER = 'Twitter';
var TRACK_ACTION_SAVE_AS_IMAGE = 'Save as image';
var TRACK_ACTION_STREET_MODIFIED_ELSEWHERE = 'Street modified elsewhere';
var TRACK_ACTION_OPEN_GALLERY = 'Open gallery';
var TRACK_ACTION_CHANGE_WIDTH = 'Change width';
var TRACK_ACTION_UNDO = 'Undo';
var TRACK_ACTION_REMOVE_SEGMENT = 'Remove segment';
var TRACK_ACTION_ERROR_15A = 'Error 15A (sign in API failure)';
var TRACK_ACTION_ERROR_RM1 = 'Error RM1 (auth 401 failure on load)';
var TRACK_ACTION_ERROR_RM2 = 'Error RM2 (auth 401 failure mid-flight)';
var TRACK_ACTION_ERROR_GEOLOCATION_TIMEOUT = 'Geolocation timeout';

var TRACK_LABEL_INCREMENT_BUTTON = 'Increment button';
var TRACK_LABEL_INPUT_FIELD = 'Input field';
var TRACK_LABEL_DRAGGING = 'Dragging';
var TRACK_LABEL_KEYBOARD = 'Keyboard';
var TRACK_LABEL_BUTTON = 'Button';

var DATE_FORMAT = 'MMM D, YYYY';

var WELCOME_NONE = 0;
var WELCOME_NEW_STREET = 1;
var WELCOME_FIRST_TIME_NEW_STREET = 2;
var WELCOME_FIRST_TIME_EXISTING_STREET = 3;

var LIVE_UPDATE_DELAY = 5000;

var SKY_COLOUR = 'rgb(169, 204, 219)';
var SKY_WIDTH = 250;
var BOTTOM_BACKGROUND = 'rgb(216, 211, 203)';
