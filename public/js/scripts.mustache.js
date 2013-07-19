/*
 * Streetmix
 *
 * Front-end (mostly) by Marcin Wichary, Code for America fellow in 2013.
 *
 * Note: This code is really gnarly. It’s been done under a lot of time 
 * pressure and there’s a lot of shortcut and tech debt. Slowly going through
 * this all.
 */

var main = (function(){
"use strict";
  var main = {};

  // TODO reorder/clean up constants

  var MESSAGES = {
    BUTTON_UNDO: 'Undo',
    BUTTON_REDO: 'Redo',

    UI_DRAG_HERE_TO_REMOVE: 'Drag here to remove',

    PROMPT_NEW_STREET_NAME: 'New street name:',
    PROMPT_DELETE_STREET: 'Are you sure you want to permanently delete [[name]]? This cannot be undone.',
    PROMPT_NEW_STREET_WIDTH: 'New street width (from [[minWidth]] to [[maxWidth]]):',

    MENU_SWITCH_TO_IMPERIAL: 'Switch to imperial units (feet)',
    MENU_SWITCH_TO_METRIC: 'Switch to metric units',

    TOOLTIP_REMOVE_SEGMENT: 'Remove segment',
    TOOLTIP_DELETE_STREET: 'Delete street',
    TOOLTIP_INCREASE_WIDTH: 'Increase width (hold Shift for more precision)',
    TOOLTIP_DECREASE_WIDTH: 'Decrease width (hold Shift for more precision)',
    TOOLTIP_ADD_FLOOR: 'Add floor',
    TOOLTIP_REMOVE_FLOOR: 'Remove floor',

    STATUS_SEGMENT_DELETED: 'The segment has been removed.',
    STATUS_ALL_SEGMENTS_DELETED: 'All segments have been removed.',
    STATUS_NOTHING_TO_UNDO: 'Nothing to undo.',
    STATUS_NOTHING_TO_REDO: 'Nothing to redo.',
    STATUS_NO_NEED_TO_SAVE: 'No need to save by hand; Streetmix automatically saves your street!',
    STATUS_NOW_REMIXING: 'Now editing a freshly-made duplicate of the original street. The duplicate has been put in your gallery.',
    STATUS_NOW_REMIXING_SIGN_IN: 'Now editing a freshly-made duplicate of the original street. <a href="/[[signInUrl]]">Sign in</a> to start your own gallery of streets.',
    STATUS_RELOADED_FROM_SERVER: 'Your street was reloaded from the server as it was modified elsewhere.',

    WARNING_TOO_WIDE: 'This segment might be too wide.',
    WARNING_NOT_WIDE_ENOUGH: 'This segment might not be wide enough.',
    WARNING_DOESNT_FIT: 'This segment doesn’t fit within the street.',

    BLOCKING_REMIXING: 'Remixing…',
    BLOCKING_LOADING: 'Loading…',

    USER_ANONYMOUS: 'Anonymous',

    SEGMENT_NAME_EMPTY: 'Empty space',
  };

  var SITE_URL = 'http://{{app_host_port}}/';
  var API_URL = '{{{restapi_proxy_baseuri_rel}}}/';

  var IP_GEOCODING_API_URL = 'http://freegeoip.net/json/';
  var IP_GEOCODING_TIMEOUT = 1000; // After this time, we don’t wait any more

  var FACEBOOK_APP_ID = '{{facebook_app_id}}';

  // TODO replace the URLs in index.html dynamically
  var URL_SIGN_IN = 'twitter-sign-in';

  var URL_SIGN_IN_CALLBACK_REL = '{{{twitter.oauth_callback_uri}}}';
  var URL_SIGN_IN_CALLBACK_ABS = 
      location.protocol + '//' + location.host + URL_SIGN_IN_CALLBACK_REL;
  var URL_SIGN_IN_CALLBACK = URL_SIGN_IN_CALLBACK_REL.replace(/^\//, '');

  var URL_JUST_SIGNED_IN_REL = '/just-signed-in';
  var URL_JUST_SIGNED_IN_ABS = 
      location.protocol + '//' + location.host + URL_JUST_SIGNED_IN_REL;
  var URL_JUST_SIGNED_IN = URL_JUST_SIGNED_IN_REL.replace(/^\//, '');

  var URL_JUST_SIGNED_IN = 'just-signed-in';
  var URL_NEW_STREET = 'new';
  var URL_NEW_STREET_COPY_LAST = 'copy-last';
  var URL_GLOBAL_GALLERY = 'gallery';
  var URL_ERROR = 'error';
  var URL_NO_USER = '-';

  var URL_SIGN_IN_REDIRECT = URL_SIGN_IN + '?callbackUri=' + 
      URL_SIGN_IN_CALLBACK_ABS + '&redirectUri=' + URL_JUST_SIGNED_IN_ABS;

  // Since URLs like “streetmix.net/new” are reserved, but we still want
  // @new to be able to use Streetmix, we prefix any reserved URLs with ~
  var RESERVED_URLS = 
      [URL_SIGN_IN, URL_SIGN_IN_CALLBACK, 
      URL_NEW_STREET, URL_NEW_STREET_COPY_LAST,
      URL_JUST_SIGNED_IN, 
      'help', URL_GLOBAL_GALLERY, URL_ERROR, 'streets'];
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

  var TWITTER_ID = '@streetmixapp';

  var NEW_STREET_DEFAULT = 1;
  var NEW_STREET_EMPTY = 2;

  var LATEST_SCHEMA_VERSION = 13;
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
  var TILESET_IMAGE_VERSION = 42;
  var TILESET_POINT_PER_PIXEL = 2.0;
  var TILE_SIZE = 12; // pixels

  var VARIANT_ICON_START_X = 164; // x24 in tileset file
  var VARIANT_ICON_START_Y = 64; // x24 in tileset file
  var VARIANT_ICON_SIZE = 24;

  var IMAGES_TO_BE_LOADED = [
    '/images/tiles-1.png',
    '/images/tiles-2.png',
    '/images/tiles-3.png',
    '/images/ui/icons/noun_project_2.svg',
    '/images/ui/icons/noun_project_536.svg',
    '/images/ui/icons/noun_project_97.svg',
    '/images/ui/icons/noun_project_72.svg',
    '/images/ui/icons/noun_project_13130.svg',
    '/images/share-icons/facebook-29.png',
    '/images/share-icons/twitter-32.png'
  ];

  // Output using cmap2file as per 
  // http://www.typophile.com/node/64147#comment-380776
  var STREET_NAME_FONT_GLYPHS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĆćĈĉĊċČčĎďĒĔĕĖėĜĝĞğĠġĤĥĨĩĪīĬĭİıĴĵĹĺĽľŁłŃŇňŌōŎŏŐőŒœŔŕŘřŚśŜŝŞşŠšŤťŨũŪūŬŭŮůŰűŴŵŶŷŸŹźŻżŽžƒˆˇ˘˙˚˛˜˝–—‘’‚“”„†‡•…‰‹›⁄€™−';
  var STREET_NAME_REMIX_SUFFIX = '(remixed)';
  var MAX_STREET_NAME_WIDTH = 50;

  var WIDTH_PALETTE_MULTIPLIER = 4;

  var CANVAS_HEIGHT = 480;
  var CANVAS_GROUND = 35;
  var CANVAS_BASELINE = CANVAS_HEIGHT - CANVAS_GROUND;

  var SEGMENT_Y_NORMAL = 265;
  var SEGMENT_Y_PALETTE = 20;
  var PALETTE_EXTRA_SEGMENT_PADDING = 5;

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
  var DRAGGING_TYPE_MOVE = 1;
  var DRAGGING_TYPE_RESIZE = 2;

  var DRAGGING_TYPE_MOVE_TRANSFER = 1;
  var DRAGGING_TYPE_MOVE_CREATE = 2;

  var DRAGGING_MOVE_HOLE_WIDTH = 40;

  var STATUS_MESSAGE_HIDE_DELAY = 15000;
  var WIDTH_EDIT_INPUT_DELAY = 200;
  var TOUCH_SEGMENT_FADEOUT_DELAY = 5000;
  var SHORT_DELAY = 100;

  var SAVE_STREET_DELAY = 500;
  var SAVE_SETTINGS_DELAY = 500;
  var NO_CONNECTION_MESSAGE_TIMEOUT = 10000;

  var BLOCKING_SHIELD_DARKEN_DELAY = 800;
  var BLOCKING_SHIELD_TOO_SLOW_DELAY = 10000;

  var BUILDING_SPACE = 300;

  var MAX_DRAG_DEGREE = 20;

  var UNDO_LIMIT = 100;

  var STREET_WIDTH_CUSTOM = -1;
  var STREET_WIDTH_SWITCH_TO_METRIC = -2;
  var STREET_WIDTH_SWITCH_TO_IMPERIAL = -3;

  var DEFAULT_NAME = 'Unnamed St';
  var DEFAULT_STREET_WIDTH = 80;
  var DEFAULT_STREET_WIDTHS = [40, 60, 80];
  var DEFAULT_BUILDING_HEIGHT_LEFT = 4;
  var DEFAULT_BUILDING_HEIGHT_RIGHT = 3;
  var DEFAULT_BUILDING_VARIANT_LEFT = 'narrow';
  var DEFAULT_BUILDING_VARIANT_RIGHT = 'wide';
  var DEFAULT_BUILDING_HEIGHT_EMPTY = 1;
  var DEFAULT_BUILDING_VARIANT_EMPTY = 'grass';

  var BUILDING_VARIANTS = ['grass', 'fence', 'narrow', 'wide'];

  var MIN_CUSTOM_STREET_WIDTH = 10;
  var MAX_CUSTOM_STREET_WIDTH = 400;
  var MIN_SEGMENT_WIDTH = 1;
  var MAX_SEGMENT_WIDTH = 400;

  var RESIZE_TYPE_INITIAL = 0;
  var RESIZE_TYPE_INCREMENT = 1;
  var RESIZE_TYPE_DRAGGING = 2;
  var RESIZE_TYPE_PRECISE_DRAGGING = 3;
  var RESIZE_TYPE_TYPING = 4;

  var IMPERIAL_METRIC_MULTIPLIER = 30 / 100;
  var COUNTRIES_IMPERIAL_UNITS = ['US'];
  var COUNTRIES_LEFT_HAND_TRAFFIC = 
      ['GG', 'AI', 'AG', 'AU', 'BS', 'BD', 'BB', 'BM', 'BT', 'BW', 'BN',
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
  var KEY_MINUS = 189;
  var KEY_MINUS_ALT = 173; // Firefox

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
      imageUrl: '/images/ui/icons/noun_project_72.svg',
      imageSize: .8
    },
    'public-transit': {
      owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
      imageUrl: '/images/ui/icons/noun_project_97.svg',
      imageSize: .8
    },
    'bike': {
      owner: SEGMENT_OWNER_BIKE,
      imageUrl: '/images/ui/icons/noun_project_536.svg',
      imageSize: 1.1
    },
    'pedestrian': {
      owner: SEGMENT_OWNER_PEDESTRIAN,
      imageUrl: '/images/ui/icons/noun_project_2.svg',
      imageSize: .8
    },
    'nature': {
      owner: SEGMENT_OWNER_NATURE,
      imageUrl: '/images/ui/icons/noun_project_13130.svg',
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
    'turn-lane-orientation': ['left', 'both', 'right'],

    'divider-type': ['median', 'striped-buffer', 'planting-strip', 
                     'bush', 'flowers', 'big-tree', 
                     'palm-tree', 'bollard'],

    'orientation': ['left', 'right'],

    'public-transit-asphalt': ['regular', 'colored'],
    'bike-asphalt': ['regular', 'colored'],

    'transit-shelter-elevation': ['street-level', 'light-rail'],
    'bike-rack-elevation': ['sidewalk', 'road'],

    'car-type': ['car', 'truck'],
    'sidewalk-density': ['empty', 'sparse', 'normal', 'dense'],

    'parking-lane-orientation': ['left', 'right'],
  };

  var VARIANT_ICONS = {
    'trashcan': { x: 3, y: 1 },

    'orientation|left': { x: 0, y: 0, title: 'Left' },
    'orientation|right': { x: 1, y: 0, title: 'Right' },
    'turn-lane-orientation|left': { x: 4, y: 0, title: 'Left' },
    'turn-lane-orientation|both': { x: 6, y: 0, title: 'Both' },
    'turn-lane-orientation|right': { x: 5, y: 0, title: 'Right' },
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
    'lamp-orientation|left': { x: 1, y: 2, title: 'Left' },
    'lamp-orientation|both': { x: 0, y: 2, title: 'Both' },
    'lamp-orientation|right': { x: 2, y: 2, title: 'Right' },
    'lamp-type|traditional': { x: 4, y: 2, title: 'Traditional' },
    'lamp-type|modern': { x: 3, y: 2, title: 'Modern' },
    'car-type|car': { x: 0, y: 3, title: 'Car' },
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
    'transit-shelter-elevation|street-level': { x: 5, y: 2, title: 'Street level' },
    'transit-shelter-elevation|light-rail': { x: 6, y: 2, title: 'Light rail platform' },
    'bike-rack-elevation|sidewalk': { x: 6, y: 2, title: 'Sidewalk' },
    'bike-rack-elevation|road': { x: 5, y: 2, title: 'Road' },
    'building|grass': { x: 2, y: 4, title: 'Grass' },
    'building|fence': { x: 3, y: 4, title: 'Fence' },
    'building|narrow': { x: 7, y: 2, title: 'Narrow building' },
    'building|wide': { x: 8, y: 2, title: 'Wide building' },
  };

  var SEGMENT_INFO = {
    'sidewalk': {
      name: 'Sidewalk',
      owner: SEGMENT_OWNER_PEDESTRIAN,
      zIndex: 2,
      defaultWidth: 6,
      variants: ['sidewalk-density'],
      details: {
        'empty': {
          minWidth: 6,
          graphics: {
            center: { tileset: 1, x: 0, y: 0, width: 4, offsetX: -1, height: 1 },
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
          }
        },
        'sparse': {
          minWidth: 6,
          graphics: {
            center: { tileset: 1, x: 0, y: 0, width: 4, offsetX: -1, height: 1 },
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
          }
        },
        'normal': {
          minWidth: 6,
          graphics: {
            center: { tileset: 1, x: 0, y: 0, width: 4, offsetX: -1, height: 1 },
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
          }
        },
        'dense': {
          minWidth: 6,
          graphics: {
            center: { tileset: 1, x: 0, y: 0, width: 4, offsetX: -1, height: 1 },
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
          }
        },
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
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
          }
        },
        'palm-tree': {
          graphics: {
            center: { tileset: 1, x: 83, y: 24, offsetX: 0, offsetY: -19, width: 14 /* 14 */, height: 31 },
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
          }
        }
      }
    },
    'sidewalk-bike-rack': {
      name: 'Bike rack',
      owner: SEGMENT_OWNER_BIKE,
      zIndex: 2,
      defaultWidth: 6,
      variants: ['orientation', 'bike-rack-elevation'],
      details: {
        'left|sidewalk': {
          graphics: {
            left: { tileset: 1, x: 67, y: 2, width: 6, height: 6, offsetY: 5 },
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
          }
        },
        'right|sidewalk': {
          graphics: {
            right: { tileset: 1, x: 61, y: 2, width: 6, height: 6, offsetY: 5 },
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
          }
        },
        'left|road': {
          graphics: {
            left: { tileset: 1, x: 67, y: 12, width: 6, height: 7, offsetY: 5 },
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }
        },
        'right|road': {
          graphics: {
            right: { tileset: 1, x: 61, y: 12, width: 6, height: 7, offsetY: 5 },
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }
        },
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
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
          }
        },
        'center': {
          graphics: {
            center: { tileset: 1, x: 74, y: 2, width: 3, height: 6, offsetY: 5 },
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
          }
        },
        'right': {
          graphics: {
            right: { tileset: 1, x: 78, y: 2, width: 3, height: 6, offsetY: 5 },
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
          }
        },
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
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
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
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }, // Concrete
          }
        },
        'both|traditional': {
          graphics: {
            center: { tileset: 3, x: 194, y: 49, width: 3, height: 15, offsetY: -4 },
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }, // Concrete
          }
        },
        'left|traditional': {
          graphics: {
            left: { tileset: 3, x: 197, y: 49, width: 3, height: 15, offsetY: -4, offsetX: -2 },
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }, // Concrete
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
      descriptionPrompt: 'Learn more about parklets',
      description: '<img src="/images/info-bubble-examples/parklets_01.jpg"><p>In 2005, San Francisco-based design studio Rebar temporarily converted a single metered parking space on downtown Mission Street into a tiny public park. The first parklet was simple: just a bench and a tree on a rectangular piece of turf, but it featured a brief instruction manual and a charge for others to make their own. With people realizing that so much of public space was really devoted to storing cars, an international movement was born, and now, the annual Park(ing) Day hosts nearly a thousand temporarily converted spots around the world.</p><p>Knowing a good idea when it sees one, San Francisco became the first city to make parklets official with its <a href="http://sfpavementtoparks.sfplanning.org/">Pavement to Parks program</a> in 2010. Today, the City by the Bay has over 50 parklets, many of which are now architecturally designed objects much improved beyond Rebar’s modest prototype. There’s an ambitious, corporate-sponsored two-block-long parklet in the heart of San Francisco’s busiest shopping corridor, and also a collection of movable, bright red “parkmobiles” (Streetmix’s default look) designed for the Yerba Buena Community Benefit District. Official parklet programs now exist in many other cities in North America, such as Philadelphia, Oakland, Kansas City, New York, Chicago, and Vancouver, and many more cities are soon to follow.</p><footer>Photo: 4033 Judah Street Parklet, courtesy of San Francisco Planning Department.</footer>',
      details: {
        'left': {
          minWidth: 8,
          graphics: {
            left: { tileset: 2, x: 136, y: 63, width: 8, height: 8, offsetY: 4 },
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }
        },
        'right': {
          minWidth: 8,
          graphics: {
            right: { tileset: 2, x: 126, y: 63, width: 8, height: 8, offsetY: 4 },
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }
        },
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
              { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
            ],
          }          
        },
        'striped-buffer': {
          name: 'Buffer',
          graphics: {
            repeat: [
              { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
              { tileset: 2, x: 116, y: 21, width: 5, height: 5, offsetY: 10 }, // Asphalt
            ],
            left: { tileset: 2, x: 119, y: 15, width: 1, height: 5, offsetY: 10 }, // Marking
            right: { tileset: 2, x: 117, y: 15, width: 1, height: 5, offsetY: 10 }, // Marking
          }          
        },
        'planting-strip': {
          name: 'Planting strip',
          graphics: {
            repeat: [
              { tileset: 2, x: 121, y: 53, width: 4, height: 5, offsetY: 10, offsetLeft: 0, offsetRight: 0 },
              { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
            ]
          }          
        },
        'bush': {
          name: 'Planting strip',
          graphics: {
            center: { tileset: 2, x: 122, y: 55, width: 2, height: 5, offsetY: 7 },
            repeat: [
              { tileset: 2, x: 121, y: 53, width: 4, height: 5, offsetY: 10, offsetLeft: 0, offsetRight: 0 },
              { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
            ]
          }          
        },
        'flowers': {
          name: 'Planting strip',
          graphics: {
            center: { tileset: 2, x: 122, y: 59, width: 2, height: 5, offsetY: 7 },
            repeat: [
              { tileset: 2, x: 121, y: 53, width: 4, height: 5, offsetY: 10, offsetLeft: 0, offsetRight: 0 },
              { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
            ]
          }          
        },
        'big-tree': {
          name: 'Planting strip',
          graphics: {
            center: { tileset: 1, x: 40, y: 56, width: 9, height: 21, offsetY: -10 }, // Big tree
            repeat: [
              { tileset: 2, x: 121, y: 53, width: 4, height: 5, offsetY: 10, offsetLeft: 0, offsetRight: 0 },
              { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
            ]
          }          
        },
        'palm-tree': {
          name: 'Planting strip',
          graphics: {
            center: { tileset: 1, x: 83, y: 24, offsetX: 0, offsetY: -19, width: 14 /* 14 */, height: 31 },
            repeat: [
              { tileset: 2, x: 121, y: 53, width: 4, height: 5, offsetY: 10, offsetLeft: 0, offsetRight: 0 },
              { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 },
            ]
          }          
        },
        'bollard': {
          name: 'Bollard',
          graphics: {
            center: { tileset: 2, x: 123, y: 64, width: 1, height: 7, offsetY: 5 },
            repeat: [
              { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
            ]
          }          
        },
      }
    },
    'bike-lane': {
      name: 'Bike lane',
      owner: SEGMENT_OWNER_BIKE,
      zIndex: 2,
      defaultWidth: 6,
      variants: ['direction', 'bike-asphalt'],
      details: {
        'inbound|regular': {
          graphics: {
            center: [
              { tileset: 1, x: 5, y: 30 + 19, width: 3, height: 8, offsetY: 4 },
              { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow (inbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }
        },
        'outbound|regular': {
          graphics: {
            center: [
              { tileset: 1, x: 9, y: 30 + 19, width: 3, height: 8, offsetY: 4 },
              { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow (outbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }
        },
        'inbound|colored': {
          graphics: {
            center: [
              { tileset: 1, x: 5, y: 30 + 19, width: 3, height: 8, offsetY: 4 },
              { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow (inbound)
            ],
            repeat: { tileset: 2, x: 98 - 10, y: 53 + 10, width: 8, height: 5, offsetY: 10 }, // Green asphalt
          }
        },
        'outbound|colored': {
          graphics: {
            center: [
              { tileset: 1, x: 9, y: 30 + 19, width: 3, height: 8, offsetY: 4 },
              { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow (outbound)
            ],
            repeat: { tileset: 2, x: 98 - 10, y: 53 + 10, width: 8, height: 5, offsetY: 10 }, // Green asphalt
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
              { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow (inbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }          
        },
        'outbound|car': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 1, x: 0, y: 27, width: 8, height: 15 }, // Car (outbound)
              { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow (outbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }          
        },
        'inbound|truck': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 1, x: 17, y: 64, width: 10, height: 12, offsetY: 0 }, // Truck (inbound)
              { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow (inbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }          
        },
        'outbound|truck': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 1, x: 29, y: 64, width: 9, height: 12, offsetY: 0 }, // Truck (outbound)
              { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow (outbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
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
              { tileset: 2, x: 125, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow
              { tileset: 1, x: 20, y: 78, width: 8, height: 6, offsetY: 6 }, // Car (outbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }          
        },
        'inbound|both': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 2, x: 153, y: 15, width: 5, height: 5, offsetY: 10 }, // Arrow
              { tileset: 1, x: 20, y: 78, width: 8, height: 6, offsetY: 6 }, // Car (outbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }          
        },
        'inbound|right': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 1, x: 83, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow
              { tileset: 1, x: 29, y: 78, width: 8, height: 6, offsetY: 6 }, // Car (outbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }          
        },
        'outbound|left': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 2, x: 134, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow
              { tileset: 1, x: 1, y: 78, width: 8, height: 6, offsetY: 6 }, // Car (outbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }          
        },
        'outbound|both': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 2, x: 148, y: 15, width: 5, height: 5, offsetY: 10 }, // Arrow
              { tileset: 1, x: 1, y: 78, width: 8, height: 6, offsetY: 6 }, // Car (outbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }          
        },
        'outbound|right': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 2, x: 143, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow
              { tileset: 1, x: 10, y: 78, width: 8, height: 6, offsetY: 6 }, // Car (outbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
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
              { tileset: 1, x: 8, y: 27, width: 8, height: 15 }, // Car (inbound)
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
              { tileset: 1, x: 8, y: 27, width: 8, height: 15 }, // Car (inbound)
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
              { tileset: 1, x: 0, y: 27, width: 8, height: 15 }, // Car (outbound)
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
              { tileset: 1, x: 0, y: 27, width: 8, height: 15 }, // Car (outbound)
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
              { tileset: 1, x: 38, y: 78, width: 14, height: 6, offsetY: 6 }, // Car (side)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }          
        },
        'sideways|right': {
          name: 'Perpendicular parking',
          minWidth: 14,
          maxWidth: 20,
          graphics: {
            right: [
              { tileset: 1, x: 54, y: 78, width: 14, height: 6, offsetY: 6 }, // Car (side)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }          
        }
      }      
    },
    'bus-lane': {
      name: 'Bus lane',
      owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
      zIndex: 2,
      defaultWidth: 10,
      variants: ['direction', 'public-transit-asphalt'],
      details: {
        'inbound|regular': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 1, x: 28, y: 27, width: 11, height: 13 }, // Bus
              { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow (inbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }
        },
        'outbound|regular': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 1, x: 16, y: 27, width: 12, height: 13 }, // Bus
              { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow (outbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }
        },
        'inbound|colored': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 1, x: 28, y: 27, width: 11, height: 13 }, // Bus
              { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow (inbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53 + 10, width: 10, height: 5, offsetY: 10 }, // Red asphalt
          }
        },
        'outbound|colored': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 1, x: 16, y: 27, width: 12, height: 13 }, // Bus
              { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow (outbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53 + 10, width: 10, height: 5, offsetY: 10 }, // Red asphalt
          }
        }
      }
    },
    'streetcar': {
      name: 'Streetcar',
      owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
      zIndex: 2,
      defaultWidth: 10,
      variants: ['direction', 'public-transit-asphalt'],
      details: {
        'inbound|regular': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 3, x: 192, y: 1, width: 12, height: 17, offsetY: -1 }, // Streetcar
              { tileset: 1, x: 28, y: 57, width: 8, height: 5, offsetY: 10 }, // Track
              { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow (inbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }          
        },
        'outbound|regular': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 3, x: 204, y: 1, width: 12, height: 17, offsetY: -1 }, // Streetcar
              { tileset: 1, x: 28, y: 57, width: 8, height: 5, offsetY: 10 }, // Track
              { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 }, // Arrow (outbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 }, // Asphalt
          }          
        },
        'inbound|colored': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 3, x: 192, y: 1, width: 12, height: 17, offsetY: -1 }, // Streetcar
              { tileset: 1, x: 18, y: 57, width: 8, height: 5, offsetY: 10 }, // Track
              { tileset: 1, x: 29, y: 15, width: 4, height: 5, offsetX: 1, offsetY: 10 }, // Dark arrow (inbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53 + 10, width: 10, height: 5, offsetY: 10 }, // Red asphalt
          }          
        },
        'outbound|colored': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 3, x: 204, y: 1, width: 12, height: 17, offsetY: -1 }, // Streetcar
              { tileset: 1, x: 18, y: 57, width: 8, height: 5, offsetY: 10 }, // Track
              { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 }, // Dark arrow (outbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53 + 10, width: 10, height: 5, offsetY: 10 }, // Red asphalt
          }          
        },
      }     
    },
    'light-rail': {
      name: 'Light rail',
      owner: SEGMENT_OWNER_PUBLIC_TRANSIT,
      zIndex: 2,
      defaultWidth: 10,
      variants: ['direction', 'public-transit-asphalt'],
      details: {
        'inbound|regular': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 1, x: 17, y: 40, width: 10, height: 17, offsetY: -5 }, // Light rail
              { tileset: 1, x: 18, y: 57, width: 8, height: 5, offsetY: 10 }, // Track
              { tileset: 1, x: 28, y: 15, width: 8, height: 5, offsetY: 10 }, // Dark arrow (inbound)
            ],
            repeat: { tileset: 2, x: 110, y: 43, width: 9, height: 5, offsetY: 10 }, // Lower concrete
          }          
        },
        'outbound|regular': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 1, x: 27, y: 40, width: 10, height: 17, offsetY: -5 }, // Light rail
              { tileset: 1, x: 18, y: 57, width: 8, height: 5, offsetY: 10 }, // Track
              { tileset: 1, x: 37, y: 15, width: 8, height: 5, offsetY: 10 }, // Dark arrow (outbound)
            ],
            repeat: { tileset: 2, x: 110, y: 43, width: 9, height: 5, offsetY: 10 }, // Lower concrete
          }          
        },
        'inbound|colored': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 1, x: 17, y: 40, width: 10, height: 17, offsetY: -5 }, // Light rail
              { tileset: 1, x: 18, y: 57, width: 8, height: 5, offsetY: 10 }, // Track
              { tileset: 1, x: 28, y: 15, width: 8, height: 5, offsetY: 10 }, // Dark arrow (inbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53 + 10, width: 10, height: 5, offsetY: 10 }, // Red asphalt
          }          
        },
        'outbound|colored': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 1, x: 27, y: 40, width: 10, height: 17, offsetY: -5 }, // Light rail
              { tileset: 1, x: 18, y: 57, width: 8, height: 5, offsetY: 10 }, // Track
              { tileset: 1, x: 37, y: 15, width: 8, height: 5, offsetY: 10 }, // Dark arrow (outbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53 + 10, width: 10, height: 5, offsetY: 10 }, // Red asphalt
          }          
        },
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
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }, // Concrete
          }          
        },
        'right|street-level': {
          minWidth: 9,
          graphics: {
            right: { tileset: 3, x: 181, y: 1, width: 9, height: 12, offsetY: -1 },
            repeat: { tileset: 2, x: 110, y: 53, width: 9, height: 5, offsetY: 10 }, // Concrete
          }          
        },
        'left|light-rail': {
          minWidth: 9,
          graphics: {
            left: { tileset: 3, x: 171, y: 51, width: 9, height: 12, offsetY: -3 },
            repeat: { tileset: 2, x: 110, y: 63, width: 9, height: 9, offsetY: 6 }, // Raised concrete
          }          
        },
        'right|light-rail': {
          minWidth: 9,
          graphics: {
            right: { tileset: 3, x: 181, y: 51, width: 9, height: 13, offsetY: -3 },
            repeat: { tileset: 2, x: 110, y: 63, width: 9, height: 9, offsetY: 6 }, // Raised concrete
          }          
        },
      }
    }
  };

  var DEFAULT_SEGMENTS = {
    false: [ // Right-hand traffic
      { type: "sidewalk", variant: { 'sidewalk-density': 'dense' }, width: 6 },
      { type: "sidewalk-tree", variant: { 'tree-type': 'big' }, width: 2 },
      { type: "transit-shelter", variant: { 'orientation': 'left', 'transit-shelter-elevation': 'street-level' }, width: 9 },
      { type: "sidewalk-lamp", variant: { 'lamp-orientation': 'right', 'lamp-type': 'modern' }, width: 2 },
      { type: "bus-lane", variant: { 'direction': 'inbound', 'public-transit-asphalt': 'regular' }, width: 10 },
      { type: "drive-lane", variant: { 'direction': 'inbound', 'car-type': 'car' }, width: 10 },
      { type: "divider", variant: { 'divider-type': 'flowers' }, width: 3 },
      { type: "turn-lane", variant: { 'direction': 'outbound', 'orientation': 'left' }, width: 10 },
      { type: "drive-lane", variant: { 'direction': 'outbound', 'car-type': 'truck' }, width: 10 },
      { type: "bike-lane", variant: { 'direction': 'outbound', 'bike-asphalt': 'colored' }, width: 6 },
      { type: "sidewalk-lamp", variant: { 'lamp-orientation': 'left', 'lamp-type': 'modern' }, width: 2 },
      { type: "sidewalk-tree", variant: { 'tree-type': 'big' }, width: 2 },
      { type: "sidewalk", variant: { 'sidewalk-density': 'normal' }, width: 6 },
      { type: "sidewalk-bench", variant: { 'bench-orientation': 'right' }, width: 2 },
    ],
    true: [ // Left-hand traffic
      { type: "sidewalk-bench", variant: { 'bench-orientation': 'left' }, width: 2 },
      { type: "sidewalk", variant: { 'sidewalk-density': 'normal' }, width: 6 },
      { type: "sidewalk-tree", variant: { 'tree-type': 'big' }, width: 2 },
      { type: "sidewalk-lamp", variant: { 'lamp-orientation': 'right', 'lamp-type': 'modern' }, width: 2 },
      { type: "bike-lane", variant: { 'direction': 'outbound', 'bike-asphalt': 'colored' }, width: 6 },
      { type: "drive-lane", variant: { 'direction': 'outbound', 'car-type': 'truck' }, width: 10 },
      { type: "turn-lane", variant: { 'direction': 'outbound', 'orientation': 'right' }, width: 10 },
      { type: "divider", variant: { 'divider-type': 'flowers' }, width: 3 },
      { type: "drive-lane", variant: { 'direction': 'inbound', 'car-type': 'car' }, width: 10 },
      { type: "bus-lane", variant: { 'direction': 'inbound', 'public-transit-asphalt': 'regular' }, width: 10 },
      { type: "sidewalk-lamp", variant: { 'lamp-orientation': 'left', 'lamp-type': 'modern' }, width: 2 },
      { type: "transit-shelter", variant: { 'orientation': 'right', 'transit-shelter-elevation': 'street-level' }, width: 9 },
      { type: "sidewalk-tree", variant: { 'tree-type': 'big' }, width: 2 },
      { type: "sidewalk", variant: { 'sidewalk-density': 'dense' }, width: 6 },
    ]
  };

  var USER_ID_COOKIE = 'user_id';
  var SIGN_IN_TOKEN_COOKIE = 'login_token';

  var LOCAL_STORAGE_SETTINGS_ID = 'settings';
  var LOCAL_STORAGE_SIGN_IN_ID = 'sign-in';
  var LOCAL_STORAGE_FEEDBACK_BACKUP = 'feedback-backup';
  var LOCAL_STORAGE_FEEDBACK_EMAIL_BACKUP = 'feedback-email-backup';

  // TODO clean up/rearrange variables

  // Saved data
  // ------------------------------------------------------------------------

  var street = {
    schemaVersion: LATEST_SCHEMA_VERSION,

    id: null,
    creatorId: null,
    namespacedId: null,
    originalStreetId: null, // id of the street the current street is remixed from (could be null)
    name: null,

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

  var lastStreet;
  
  var undoStack = [];
  var undoPosition = 0;
  var ignoreStreetChanges = false;  

  var settings = {
    lastStreetId: null,
    lastStreetNamespacedId: null,
    lastStreetUserId: null,
    priorLastStreetId: null, // Do not save
    newStreetPreference: null
  };

  var units = SETTINGS_UNITS_IMPERIAL;

  var leftHandTraffic = false;

  var ignoreWindowFocus = false;

  var images = [];

  var avatarCache = {};

  var suppressMouseEnter = false;

  // ------------------------------------------------------------------------

  var mode;
  var errorUrl = '';
  var abortEverything;
  var currentErrorType;

  var draggingType = DRAGGING_TYPE_NONE;

  var draggingResize = {
    segmentEl: null,
    floatingEl: null,
    mouseX: null,
    mouseY: null,
    elX: null,
    elY: null,
    originalX: null,
    originalWidth: null,
    originalType: null,
    originalVariantString: null,
    right: false
  };

  var draggingMove = {
    type: null,
    active: false,
    withinCanvas: null,
    segmentBeforeEl: null,
    segmentAfterEl: null,
    mouseX: null,
    mouseY: null,
    el: null,
    elX: null,
    elY: null,
    originalEl: null,
    originalWidth: null,
    originalType: null,
    originalVariantString: null,
    floatingElVisible: false
  };

  var initializing = false;

  var widthEditHeld = false;
  var resizeSegmentTimerId = -1;

  var galleryVisible = false;

  var streetSectionCanvasLeft;

  var images;
  var imagesToBeLoaded;

  var bodyLoaded;
  var readyStateCompleteLoaded;  
  var countryLoaded;
  var serverContacted;

  var saveStreetTimerId = -1;
  var saveStreetIncomplete = false;
  var remixOnFirstEdit = false;
  var saveSettingsTimerId = -1;

  var signedIn = false;
  var signInLoaded = false;
  var signInData = null;

  // Auto “promote” (remix) the street if you just signed in and the street
  // was anonymous
  var promoteStreet = false;

  var mouseX;
  var mouseY;

  var system = {
    apiUrl: null,
    touch: false,
    hiDpi: 1.0,
    cssTransform: false,
    ipAddress: null,

    safari: false,

    viewportWidth: null,
    viewportHeight: null
  };

  var debug = {
    hoverPolygon: false,
    forceLeftHandTraffic: false,
    forceMetric: false,
    forceUnsupportedBrowser: false,
  };

  var streetSectionTop;

  var segmentWidthResolution;
  var segmentWidthClickIncrement;
  var segmentWidthDraggingResolution;

  var galleryUserId = null;
  var galleryStreetId = null;
  var galleryStreetLoaded = false;

  var nonblockingAjaxRequests = [];
  //var nonblockingAjaxRequestCount = 0;

  var nonblockingAjaxRequestTimer = 0;

  var NON_BLOCKING_AJAX_REQUEST_TIME = [10, 500, 1000, 5000, 10000];
  var NON_BLOCKING_AJAX_REQUEST_BACKOFF_RANGE = 60000;

  var NON_BLOCKING_NO_CONNECTION_MESSAGE_TIMER_COUNT = 4;

  //0-4 seconds 2^2
  //0-8 seconds 2^3

  var blockingAjaxRequest;
  var blockingAjaxRequestDoneFunc;
  var blockingAjaxRequestCancelFunc;
  var blockingAjaxRequestInProgress = false;

  var blockingShieldTimerId = -1;
  var blockingShieldTooSlowTimerId = -1;

  // HELPER FUNCTIONS
  // -------------------------------------------------------------------------

  function RandomGenerator() {
    this.randSeed = 0;
  }

  RandomGenerator.prototype.rand = function() {
    var t32 = 0x100000000;
    var constant = 134775813;
    var x = (constant * this.randSeed + 1);
    return (this.randSeed = x % t32) / t32;    
  }

  RandomGenerator.prototype.seed = function(seed) {
    this.randSeed = seed;
  }

  function htmlEncode(value){
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
  }


  function msg(messageId, data) {
    if (data) {
      return MESSAGES[messageId].supplant(data);
    } else {
      return MESSAGES[messageId];
    }
  }

  String.prototype.supplant = function(o) {
    return this.replace(/\[\[([^\[\]]*)\]\]/g,
      function (a, b) {
        var r = o[b];
        return typeof r === 'string' || typeof r === 'number' ? r : a;
      }
    );
  };

  function _createTimeout(fn, data, delay) {
    window.setTimeout(function() { fn.call(null, data); }, delay);
  }

  function _removeElFromDom(el) {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  function _getElAbsolutePos(el) {
    var pos = [0, 0];

    do {
      pos[0] += el.offsetLeft + (el.cssTransformLeft || 0);
      pos[1] += el.offsetTop + (el.cssTransformTop || 0);

      el = el.offsetParent;
    } while (el);

    return pos;
  }

  function _clone(obj) {
    if (jQuery.isArray(obj)) {
      return jQuery.extend(true, [], obj);
    } else {  
      return jQuery.extend(true, {}, obj);
    }
  }

  // -------------------------------------------------------------------------

  function _drawSegmentImage(tileset, ctx, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (!sw || !sh || !dw || !dh) {
      return;
    }

    if (imagesToBeLoaded == 0) {

      // TODO move
      var TILESET_CORRECTION = [null, 0, -84, -162];
      sx += TILESET_CORRECTION[tileset] * 12;

      ctx.drawImage(images['/images/tiles-' + tileset + '.png'],
          sx * TILESET_POINT_PER_PIXEL, sy * TILESET_POINT_PER_PIXEL, 
          sw * TILESET_POINT_PER_PIXEL, sh * TILESET_POINT_PER_PIXEL,
          dx * system.hiDpi, dy * system.hiDpi, 
          dw * system.hiDpi, dh * system.hiDpi);
    }
  }

  function _drawProgrammaticPeople(ctx, width, offsetLeft, offsetTop, multiplier, variantString) {
    // TODO move
    var PERSON_TYPES = 14;

    var people = [];
    var peopleWidth = 0;

    var variantArray = _getVariantArray('sidewalk', variantString);

    switch (variantArray['sidewalk-density']) {
      case 'empty':
        return;
        break;  
      case 'sparse':
        var widthConst = 60;
        var widthRand = 100;
        break;
      case 'normal':
        var widthConst = 12;
        var widthRand = 60;
        break;
      case 'dense':
        var widthConst = 12;
        var widthRand = 12;
        break;
    }

    var randomGenerator = new RandomGenerator();
    randomGenerator.seed(35);

    var lastPersonType = 0;

    var peopleCount = 0;

    while ((!peopleCount) || (peopleWidth < width - 36)) {
      var person = {};
      person.left = peopleWidth;
      do {
        person.type = Math.floor(randomGenerator.rand() * PERSON_TYPES);
      } while (person.type == lastPersonType);
      lastPersonType = person.type;

      var lastWidth = widthConst + randomGenerator.rand() * widthRand;

      peopleWidth += lastWidth;
      people.push(person);
      peopleCount++;
    }
    peopleWidth -= lastWidth;

    var startLeft = (width - peopleWidth) / 2;

    for (var i in people) {
      var person = people[i];
      _drawSegmentImage(2, ctx, 1056 + 12 + 48 * person.type, 0, 48, 24 * 4, 
          offsetLeft + (person.left - 24 + startLeft) * multiplier, offsetTop + 35 * multiplier, 48 * multiplier, 24 * 4 * multiplier);
    }
  }

  function _getVariantInfoDimensions(variantInfo, initialSegmentWidth, multiplier) {
    //var multiplier = palette ? (TILE_SIZE / WIDTH_PALETTE_MULTIPLIER) : 1;

    var segmentWidth = initialSegmentWidth / TILE_SIZE / multiplier;

    var center = segmentWidth / 2;
    var left = center;
    var right = center;

    if (variantInfo.graphics.center) {
      var graphic = variantInfo.graphics.center;
      for (var l = 0; l < graphic.length; l++) {
        var newLeft = center - graphic[l].width / 2 + (graphic[l].offsetX || 0);
        var newRight = center + graphic[l].width / 2 + (graphic[l].offsetX || 0);

        if (newLeft < left) {
          left = newLeft;
        }
        if (newRight > right) {
          right = newRight;
        }
      }
    }

    if (variantInfo.graphics.left) {
      var graphic = variantInfo.graphics.left;
      for (var l = 0; l < graphic.length; l++) {
        var newLeft = graphic[l].offsetX || 0;
        var newRight = graphic[l].width + (graphic[l].offsetX || 0);

        if (newLeft < left) {
          left = newLeft;
        }
        if (newRight > right) {
          right = newRight;
        }
      }
    }

    if (variantInfo.graphics.right) {
      var graphic = variantInfo.graphics.right;
      for (var l = 0; l < graphic.length; l++) {
        var newLeft = (segmentWidth) - (graphic[l].offsetX || 0) - graphic[l].width;
        var newRight = (segmentWidth) - (graphic[l].offsetX || 0);

        if (newLeft < left) {
          left = newLeft;
        }
        if (newRight > right) {
          right = newRight;
        }
      }
    }

    if (variantInfo.graphics.repeat && variantInfo.graphics.repeat[0]) {
      var newLeft = center - (segmentWidth / 2);
      var newRight = center + (segmentWidth / 2);

      if (newLeft < left) {
        left = newLeft;
      }
      if (newRight > right) {
        right = newRight;
      }
    }

    return { left: left, right: right, center: center };
  }

  function _drawSegmentContents(ctx, type, variantString, segmentWidth, offsetLeft, offsetTop, multiplier, palette) {
    var segmentInfo = SEGMENT_INFO[type];
    var variantInfo = SEGMENT_INFO[type].details[variantString];

    var dimensions = _getVariantInfoDimensions(variantInfo, segmentWidth, multiplier);
    var left = dimensions.left;
    var right = dimensions.right;
    var center = dimensions.center;

    if (variantInfo.graphics.repeat) {
      for (var l = 0; l < variantInfo.graphics.repeat.length; l++) {
        var repeatPositionX = variantInfo.graphics.repeat[l].x * TILE_SIZE;
        var repeatPositionY = (variantInfo.graphics.repeat[l].y || 0) * TILE_SIZE;
        var w = variantInfo.graphics.repeat[l].width * TILE_SIZE * multiplier;

        var count = Math.floor((segmentWidth) / w + 1);

        if (left < 0) {
          var repeatStartX = -left * TILE_SIZE;
        } else {
          var repeatStartX = 0;
        }

        for (var i = 0; i < count; i++) {
          // remainder
          if (i == count - 1) {
            w = segmentWidth - (count - 1) * w;
          }

          _drawSegmentImage(variantInfo.graphics.repeat[l].tileset, ctx,
            repeatPositionX, repeatPositionY, 
            w, variantInfo.graphics.repeat[l].height * TILE_SIZE, 
            offsetLeft + (repeatStartX + (i * variantInfo.graphics.repeat[l].width) * TILE_SIZE) * multiplier, 
            offsetTop + (multiplier * TILE_SIZE * (variantInfo.graphics.repeat[l].offsetY || 0)), 
            w, 
            variantInfo.graphics.repeat[l].height * TILE_SIZE * multiplier);
        }
      }
    } 

    if (variantInfo.graphics.left) {
      for (var l = 0; l < variantInfo.graphics.left.length; l++) {
        var leftPositionX = variantInfo.graphics.left[l].x * TILE_SIZE;
        var leftPositionY = (variantInfo.graphics.left[l].y || 0) * TILE_SIZE;

        var w = variantInfo.graphics.left[l].width * TILE_SIZE;

        var x = 0 + (-left + (variantInfo.graphics.left[l].offsetX || 0)) * TILE_SIZE * multiplier;

        _drawSegmentImage(variantInfo.graphics.left[l].tileset, ctx,
            leftPositionX, leftPositionY, 
            w, variantInfo.graphics.left[l].height * TILE_SIZE, 
            offsetLeft + x,
            offsetTop + (multiplier * TILE_SIZE * (variantInfo.graphics.left[l].offsetY || 0)), 
            w * multiplier, variantInfo.graphics.left[l].height * TILE_SIZE * multiplier);
      }
    }

    if (variantInfo.graphics.right) {
      for (var l = 0; l < variantInfo.graphics.right.length; l++) {
        var rightPositionX = variantInfo.graphics.right[l].x * TILE_SIZE;
        var rightPositionY = (variantInfo.graphics.right[l].y || 0) * TILE_SIZE;

        var w = variantInfo.graphics.right[l].width * TILE_SIZE;

        var x = (-left + segmentWidth / TILE_SIZE / multiplier - variantInfo.graphics.right[l].width - (variantInfo.graphics.right[l].offsetX || 0)) * TILE_SIZE * multiplier;

        _drawSegmentImage(variantInfo.graphics.right[l].tileset, ctx,
          rightPositionX, rightPositionY, 
          w, variantInfo.graphics.right[l].height * TILE_SIZE,
          offsetLeft + x,
          offsetTop + (multiplier * TILE_SIZE * (variantInfo.graphics.right[l].offsetY || 0)), 
          w * multiplier, variantInfo.graphics.right[l].height * TILE_SIZE * multiplier);
      }
    }
    
    if (variantInfo.graphics.center) {
      for (var l = 0; l < variantInfo.graphics.center.length; l++) {
        var bkPositionX = (variantInfo.graphics.center[l].x || 0) * TILE_SIZE;
        var bkPositionY = (variantInfo.graphics.center[l].y || 0) * TILE_SIZE;

        var width = variantInfo.graphics.center[l].width;

        var x = (center - variantInfo.graphics.center[l].width / 2 - left - (variantInfo.graphics.center[l].offsetX || 0)) * TILE_SIZE * multiplier;

        _drawSegmentImage(variantInfo.graphics.center[l].tileset, ctx,
          bkPositionX, bkPositionY, 
          width * TILE_SIZE, variantInfo.graphics.center[l].height * TILE_SIZE, 
          offsetLeft + x, 
          offsetTop + (multiplier * TILE_SIZE * (variantInfo.graphics.center[l].offsetY || 0)), 
          width * TILE_SIZE * multiplier, variantInfo.graphics.center[l].height * TILE_SIZE * multiplier);
      }
    }

    if (type == 'sidewalk') {
      _drawProgrammaticPeople(ctx, segmentWidth / multiplier, offsetLeft - left * TILE_SIZE * multiplier, offsetTop, multiplier, variantString);
    }
  }

  function _setSegmentContents(el, type, variantString, segmentWidth, palette, quickUpdate) {
    var segmentInfo = SEGMENT_INFO[type];
    var variantInfo = SEGMENT_INFO[type].details[variantString];

    var multiplier = palette ? (WIDTH_PALETTE_MULTIPLIER / TILE_SIZE) : 1;
    var dimensions = _getVariantInfoDimensions(variantInfo, segmentWidth, multiplier);

    var totalWidth = dimensions.right - dimensions.left;

    var offsetTop = palette ? SEGMENT_Y_PALETTE : SEGMENT_Y_NORMAL;

    if (!quickUpdate) {
      var hoverBkEl = document.createElement('div');
      hoverBkEl.classList.add('hover-bk');
    }

    if (!quickUpdate) {
      var canvasEl = document.createElement('canvas');
      canvasEl.classList.add('image');
    } else {
      var canvasEl = el.querySelector('canvas');
    }
    canvasEl.width = totalWidth * TILE_SIZE * system.hiDpi;
    canvasEl.height = CANVAS_BASELINE * system.hiDpi;
    canvasEl.style.width = (totalWidth * TILE_SIZE) + 'px';
    canvasEl.style.height = CANVAS_BASELINE + 'px';

    canvasEl.style.left = (dimensions.left * TILE_SIZE * multiplier) + 'px';

    var ctx = canvasEl.getContext('2d');

    _drawSegmentContents(ctx, type, variantString, segmentWidth, 0, offsetTop, multiplier, palette);

    if (!quickUpdate) {
      _removeElFromDom(el.querySelector('canvas'));
      el.appendChild(canvasEl);

      _removeElFromDom(el.querySelector('.hover-bk'));
      el.appendChild(hoverBkEl);
    }
  }


  function _onWidthEditClick(event) {
    var el = event.target;

    el.hold = true;
    widthEditHeld = true;

    if (document.activeElement != el) {
      el.select();
    }
  }

  function _onWidthEditMouseOver(event) {
    if (!widthEditHeld) {
      event.target.focus();
      event.target.select();
    }
  }

  function _onWidthEditMouseOut(event) {
    var el = event.target;
    if (!widthEditHeld) {
      _loseAnyFocus();
    }
  }

  function _loseAnyFocus() {
    document.body.focus();
  }

  function _onWidthEditFocus(event) {
    var el = event.target;

    el.oldValue = el.realValue;
    el.value = _prettifyWidth(el.realValue, PRETTIFY_WIDTH_INPUT);
  }

  function _onWidthEditBlur(event) {
    var el = event.target;

    _widthEditInputChanged(el, true);

    el.realValue = parseFloat(el.segmentEl.getAttribute('width'));
    el.value = _prettifyWidth(el.realValue, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);

    el.hold = false;
    widthEditHeld = false;
  }

  function _processWidthInput(widthInput) {
    widthInput = widthInput.replace(/ /g, '');
    widthInput = widthInput.replace(/,/g, '.');

    for (var i in IMPERIAL_VULGAR_FRACTIONS) {
      if (widthInput.indexOf(IMPERIAL_VULGAR_FRACTIONS[i]) != -1) {
        widthInput = widthInput.replace(new RegExp(IMPERIAL_VULGAR_FRACTIONS[i]), i);
      }
    }

    var width = parseFloat(widthInput);

    if (width) {
      // Default unit
      switch (street.units) {
        case SETTINGS_UNITS_METRIC:
          var multiplier = 1 / IMPERIAL_METRIC_MULTIPLIER;
          break;
        case SETTINGS_UNITS_IMPERIAL:
          var multiplier = 1;
          break;
      }

      for (var i in WIDTH_INPUT_CONVERSION) {
        if (widthInput.match(new RegExp("[\\d\\.]" + 
              WIDTH_INPUT_CONVERSION[i].text + "$"))) {
          var multiplier = WIDTH_INPUT_CONVERSION[i].multiplier;
          break;
        }
      }

      width *= multiplier;
    }

    return width;
  }

  function _widthEditInputChanged(el, immediate) {
    window.clearTimeout(resizeSegmentTimerId);

    var width = _processWidthInput(el.value);

    if (width) {
      var segmentEl = el.segmentEl;

      if (immediate) {
        _resizeSegment(segmentEl, RESIZE_TYPE_TYPING, 
            width * TILE_SIZE, false, false, true);
        _infoBubble.updateWidthButtonsInContents(width);
      } else {
        resizeSegmentTimerId = window.setTimeout(function() {
          _resizeSegment(segmentEl, RESIZE_TYPE_TYPING,
          width * TILE_SIZE, false, false, true);
        _infoBubble.updateWidthButtonsInContents(width);
        }, WIDTH_EDIT_INPUT_DELAY);
      }
    }
  }

  function _onWidthEditInput(event) {
    _widthEditInputChanged(event.target, false);
  }

  function _onWidthEditKeyDown(event) {
    var el = event.target;

    switch (event.keyCode) {
      case KEY_ENTER:
        _widthEditInputChanged(el, true);
        _loseAnyFocus();
        el.value = _prettifyWidth(el.segmentEl.getAttribute('width'), PRETTIFY_WIDTH_INPUT);
        el.focus();
        el.select();
        break;
      case KEY_ESC:
        el.value = el.oldValue;
        _widthEditInputChanged(el, true);
        _hideMenus();
        _loseAnyFocus();
        break;
    }
  }

  function _normalizeStreetWidth(width) {
    if (width < MIN_CUSTOM_STREET_WIDTH) {
      width = MIN_CUSTOM_STREET_WIDTH;
    } else if (width > MAX_CUSTOM_STREET_WIDTH) {
      width = MAX_CUSTOM_STREET_WIDTH;
    }

    var resolution = segmentWidthResolution;

    width = 
        Math.round(width / resolution) * resolution;

    return width;    
  }

  function _normalizeSegmentWidth(width, resizeType) {
    if (width < MIN_SEGMENT_WIDTH) {
      width = MIN_SEGMENT_WIDTH;
    } else if (width > MAX_SEGMENT_WIDTH) {
      width = MAX_SEGMENT_WIDTH;
    }    

    switch (resizeType) {
      case RESIZE_TYPE_INITIAL:
      case RESIZE_TYPE_TYPING:
      case RESIZE_TYPE_INCREMENT:
      case RESIZE_TYPE_PRECISE_DRAGGING:
        var resolution = segmentWidthResolution;
        break;
      case RESIZE_TYPE_DRAGGING:
        var resolution = segmentWidthDraggingResolution;
        break;
    }

    width = Math.round(width / resolution) * resolution;
    width = parseFloat(width.toFixed(NORMALIZE_PRECISION));

    return width;
  }

  function _prettifyWidth(width, purpose) {
    var remainder = width - Math.floor(width);

    switch (street.units) {
      case SETTINGS_UNITS_IMPERIAL:
        var widthText = width;

        if (purpose != PRETTIFY_WIDTH_INPUT) {
          if (IMPERIAL_VULGAR_FRACTIONS[('' + remainder).substr(1)]) {
            var widthText = 
                (Math.floor(width) ? Math.floor(width) : '') + 
                IMPERIAL_VULGAR_FRACTIONS[('' + remainder).substr(1)];      
          }
        }

        switch (purpose) {
          case PRETTIFY_WIDTH_OUTPUT_NO_MARKUP:
            widthText += '\'';
            break;
          case PRETTIFY_WIDTH_OUTPUT_MARKUP:
            widthText += '<wbr>\'';
            break;
        }
        break;
      case SETTINGS_UNITS_METRIC:
        var widthText = '' + 
            (width * IMPERIAL_METRIC_MULTIPLIER).toFixed(METRIC_PRECISION);

        if (widthText.substr(0, 2) == '0.') {
          widthText = widthText.substr(1);
        }
        while (widthText.substr(widthText.length - 1) == '0') {
          widthText = widthText.substr(0, widthText.length - 1);
        }
        if (widthText.substr(widthText.length - 1) == '.') {
          widthText = widthText.substr(0, widthText.length - 1);
        }

        switch (purpose) {
          case PRETTIFY_WIDTH_OUTPUT_NO_MARKUP:
            widthText += ' m';
            break;
          case PRETTIFY_WIDTH_OUTPUT_MARKUP:
            widthText += '<wbr> m';          
            break;
        }
        break;
    }

    return widthText;
  }

  function _incrementSegmentWidth(segmentEl, add, precise) {
    var width = parseFloat(segmentEl.getAttribute('width'));

    if (precise) {
      var increment = segmentWidthResolution;
    } else {
      var increment = segmentWidthClickIncrement;
    }

    if (!add) {
      increment = -increment;
    }
    width = _normalizeSegmentWidth(width + increment, RESIZE_TYPE_INCREMENT);

    _resizeSegment(segmentEl, RESIZE_TYPE_INCREMENT,
        width * TILE_SIZE, true, false, true);
  }

  function _onWidthDecrementClick(event) {
    var el = event.target;
    var segmentEl = el.segmentEl;
    var precise = event.shiftKey;
    
    _incrementSegmentWidth(segmentEl, false, precise);
    _scheduleControlsFadeout(segmentEl);
  }

  function _onWidthIncrementClick(event) {
    var el = event.target;
    var segmentEl = el.segmentEl;
    var precise = event.shiftKey;

    _incrementSegmentWidth(segmentEl, true, precise);
    _scheduleControlsFadeout(segmentEl);
  }

  function _resizeSegment(el, resizeType, width, updateEdit, palette, immediate, initial) {
    if (!palette) {
      var width = 
          _normalizeSegmentWidth(width / TILE_SIZE, resizeType) * TILE_SIZE;
    }

    if (immediate) {
      document.body.classList.add('immediate-segment-resize');

      window.setTimeout(function() {
        document.body.classList.remove('immediate-segment-resize');
      }, SHORT_DELAY);
    }

    var oldWidth = parseFloat(el.getAttribute('width') * TILE_SIZE);

    el.style.width = width + 'px';
    el.setAttribute('width', width / TILE_SIZE);

    var widthEl = el.querySelector('span.width');
    if (widthEl) {
      widthEl.innerHTML = 
          _prettifyWidth(width / TILE_SIZE, PRETTIFY_WIDTH_OUTPUT_MARKUP);
    }

    _setSegmentContents(el, el.getAttribute('type'), 
      el.getAttribute('variant-string'), width, palette);

    if (updateEdit) {
      _infoBubble.updateWidthInContents(el, width / TILE_SIZE);
    }

    if (!initial) {
      _segmentsChanged();

      if (oldWidth != width) {
        _showWidthChartImmediately();
      }
    }
  }

  function _getVariantString(variant) {
    var string = '';
    for (var i in variant) {
      string += variant[i] + VARIANT_SEPARATOR;
    }

    string = string.substr(0, string.length - 1);
    return string;
  }

  function _createSegment(type, variantString, width, isUnmovable, palette) {
    var el = document.createElement('div');
    el.classList.add('segment');
    el.setAttribute('type', type);
    el.setAttribute('variant-string', variantString);

    if (isUnmovable) {
      el.classList.add('unmovable');
    }
    
    //_setSegmentContents(el, type, variantString, width, palette);

    if (!palette) {
      el.style.zIndex = SEGMENT_INFO[type].zIndex;

      var variantInfo = SEGMENT_INFO[type].details[variantString];
      var name = variantInfo.name || SEGMENT_INFO[type].name;

      var innerEl = document.createElement('span');
      innerEl.classList.add('name');
      innerEl.innerHTML = name;
      el.appendChild(innerEl);

      var innerEl = document.createElement('span');
      innerEl.classList.add('width');
      el.appendChild(innerEl);

      var dragHandleEl = document.createElement('span');
      dragHandleEl.classList.add('drag-handle');
      dragHandleEl.classList.add('left');
      dragHandleEl.segmentEl = el;
      dragHandleEl.innerHTML = '‹';
      dragHandleEl.addEventListener('mouseover', _showWidthChart);
      dragHandleEl.addEventListener('mouseout', _hideWidthChart);
      el.appendChild(dragHandleEl);

      var dragHandleEl = document.createElement('span');
      dragHandleEl.classList.add('drag-handle');
      dragHandleEl.classList.add('right');
      dragHandleEl.segmentEl = el;
      dragHandleEl.innerHTML = '›';
      dragHandleEl.addEventListener('mouseover', _showWidthChart);
      dragHandleEl.addEventListener('mouseout', _hideWidthChart);
      el.appendChild(dragHandleEl);

      /*var commandsEl = document.createElement('span');
      commandsEl.classList.add('commands');

      el.appendChild(commandsEl);*/

      var innerEl = document.createElement('span');
      innerEl.classList.add('grid');
      el.appendChild(innerEl);
    } else {
      el.setAttribute('title', SEGMENT_INFO[type].name);
    }

    if (width) {
      _resizeSegment(el, RESIZE_TYPE_INITIAL, width, true, palette, true, true);
    }    

    if (!palette) {
      $(el).mouseenter(_onSegmentMouseEnter);
      $(el).mouseleave(_onSegmentMouseLeave);
    }      
    return el;
  }

  function _drawBuilding(ctx, street, left, totalWidth, totalHeight, bottomAligned, offsetLeft, offsetTop, multiplier) {
    var buildingVariant = left ? street.leftBuildingVariant : street.rightBuildingVariant;
    var flooredBuilding = _isFlooredBuilding(buildingVariant);

    if (left) {
      switch (street.leftBuildingVariant) {
        case 'narrow':
          var tilePositionX = 1512;
          var width = 216;
          var variantsCount = 2;
          var tileset = 2;
          break;
        case 'wide':
          var tilePositionX = 1956;
          var width = 396;
          var variantsCount = 1;
          var tileset = 3;
          break;
      }
    } else {
      switch (street.rightBuildingVariant) {
        case 'narrow':
          var tilePositionX = 1728;
          var width = 216;
          var variantsCount = 2;
          var tileset = 2;
          break;
        case 'wide':
          var tilePositionX = 2351;
          var width = 396;
          var variantsCount = 1;
          var tileset = 3;
          break;
      }
    }

    if (!flooredBuilding) {
      var floorCount = 4;
    } else {
      var floorCount = left ? street.leftBuildingHeight : street.rightBuildingHeight;
    }
    var height = TILE_SIZE * (1 + 10 * (floorCount - 1) + 10) * multiplier;    

    if (bottomAligned) {
      offsetTop += totalHeight - height;
    }

    if (!flooredBuilding) {
      var width = 48;

      var tileset = 1;

      if (left) {
        var posShift = (totalWidth % width) - 121;
      } else {
        var posShift = 25;
      }

      switch (buildingVariant) {
        case 'fence': 
          if (left) {
            var origPos = 1344 / 2;            
          } else {
            var origPos = 1224 / 2;            
          }
          break;
        case 'grass':
          var origPos = 1104 / 2;
          break;
      }

      for (var i = 0; i < totalWidth / width + 1; i++) {
        _drawSegmentImage(tileset, ctx,
            origPos, 0, width, 168 + 12,
            offsetLeft + (posShift + i * width) * multiplier, 
            offsetTop + (409 - 12) * multiplier, 
            width * multiplier, 
            (168 + 12) * multiplier);
      }
    } else {
      // Floored buildings

      if (left) {
        var leftPos = totalWidth - width - 2;
      } else {
        var leftPos = 0;
      }

      var floorHeight = 10 * TILE_SIZE;
      var roofHeight = 1 * TILE_SIZE;

      // bottom floor

      _drawSegmentImage(tileset, ctx,
          tilePositionX, 576 - 240 + 120 * variantsCount, width, floorHeight + TILE_SIZE,
          offsetLeft + leftPos * multiplier, offsetTop + height - floorHeight * multiplier, 
          width * multiplier, (floorHeight + TILE_SIZE) * multiplier);

      // middle floors

      var randomGenerator = new RandomGenerator();
      randomGenerator.seed(0);

      for (var i = 1; i < floorCount; i++) {   
        var variant = Math.floor(randomGenerator.rand() * variantsCount) + 1;

        _drawSegmentImage(tileset, ctx,
            tilePositionX, 576 - 240 + 120 * variantsCount - (floorHeight * variant), width, floorHeight,
            offsetLeft + leftPos * multiplier, offsetTop + height - floorHeight * (i + 1) * multiplier, 
            width * multiplier, floorHeight * multiplier);
      }

      // roof

      _drawSegmentImage(tileset, ctx,
          tilePositionX, 576 - floorHeight * 2 - roofHeight, width, roofHeight,
          offsetLeft + leftPos * multiplier, 
          offsetTop + height - floorHeight * (floorCount) * multiplier - roofHeight * multiplier, 
          width * multiplier, roofHeight * multiplier);
    }

    if (street.remainingWidth < 0) {
      ctx.globalCompositeOperation = 'source-atop';
      // TODO const
      ctx.fillStyle = 'rgb(133, 183, 204)';
      //ctx.globalAlpha = .;
      ctx.fillRect(0, 0, totalWidth * system.hiDpi, totalHeight * system.hiDpi);
    }
  }

  // TODO change to array
  function _isFlooredBuilding(buildingVariant) {
    if ((buildingVariant == 'narrow') || (buildingVariant == 'wide')) {
      return true;
    } else {
      return false;
    }
  }

  function _createBuilding(el, left) {
    var totalWidth = 
        document.querySelector('#street-section-left-building').offsetWidth;

    var buildingVariant = 
        left ? street.leftBuildingVariant : street.rightBuildingVariant;
    var floorCount = 
        left ? street.leftBuildingHeight : street.rightBuildingHeight;
    
    var flooredBuilding = _isFlooredBuilding(buildingVariant);
    if (!flooredBuilding) {
      floorCount = 4;
    }
    var height = TILE_SIZE * (1 + 10 * (floorCount - 1) + 10);    

    var canvasEl = document.createElement('canvas');
    canvasEl.width = totalWidth * system.hiDpi;
    canvasEl.height = height * system.hiDpi;
    canvasEl.style.width = totalWidth + 'px';
    canvasEl.style.height = height + 'px';

    el.appendChild(canvasEl);

    var ctx = canvasEl.getContext('2d');

    _drawBuilding(ctx, street, left, totalWidth, height, false, 0, 0, 1.0);
  }

  function _changeBuildingHeight(left, increment) {
    if (left) {
      if (increment) {
        if (street.leftBuildingHeight < 10) {
          street.leftBuildingHeight++;
        }
      } else if (street.leftBuildingHeight > 1) {
        street.leftBuildingHeight--;
      }
    } else {
      if (increment) {
        if (street.rightBuildingHeight < 10) {
          street.rightBuildingHeight++;
        }
      } else if (street.rightBuildingHeight > 1) {
        street.rightBuildingHeight--;
      }
    }

    _saveStreetToServerIfNecessary();
    _createBuildings();
  }

  function _createBuildings() {
    var el = document.querySelector('#street-section-left-building');
    // TODO nasty
    el.innerHTML = '<div class="hover-bk"></div>';
    _createBuilding(el, true);

    var el = document.querySelector('#street-section-right-building');
    el.innerHTML = '<div class="hover-bk"></div>';
    _createBuilding(el, false);
  }  

  function _createSegmentDom(segment) {
    return _createSegment(segment.type, segment.variantString, 
        segment.width * TILE_SIZE, segment.unmovable);
  }  

  function _onSegmentMouseEnter(event) {
    if (suppressMouseEnter) {
      return;
    }

    _infoBubble.considerShowing(event, this, INFO_BUBBLE_TYPE_SEGMENT);
  }

  function _onSegmentMouseLeave() {
    _infoBubble.dontConsiderShowing();
  }

  function _onBuildingMouseEnter(event) {
    if (this.id == 'street-section-left-building') {
      var type = INFO_BUBBLE_TYPE_LEFT_BUILDING;
    } else {
      var type = INFO_BUBBLE_TYPE_RIGHT_BUILDING;
    }

    _infoBubble.considerShowing(event, this, type);
  }

  function _onBuildingMouseLeave() {
    _infoBubble.dontConsiderShowing();
  }

  function _createDomFromData() {
    document.querySelector('#street-section-editable').innerHTML = '';

    for (var i in street.segments) {
      var segment = street.segments[i];

      var el = _createSegmentDom(segment);
      document.querySelector('#street-section-editable').appendChild(el);

      segment.el = el;
      segment.el.dataNo = i;
    }

    _repositionSegments();
    _updateBuildingPosition();
    _createBuildings();
  }

  function _repositionSegments() {
    var left = 0;
    var noMoveLeft = 0;

    var extraWidth = 0;

    for (var i in street.segments) {
      var el = street.segments[i].el;

      if (el == draggingMove.segmentBeforeEl) {
        left += DRAGGING_MOVE_HOLE_WIDTH;
        extraWidth += DRAGGING_MOVE_HOLE_WIDTH;

        if (!draggingMove.segmentAfterEl) {
          left += DRAGGING_MOVE_HOLE_WIDTH;
          extraWidth += DRAGGING_MOVE_HOLE_WIDTH;
        }
      }

      if (el.classList.contains('dragged-out')) {
        var width = 0;
      } else {
        var width = parseFloat(el.getAttribute('width')) * TILE_SIZE;
      }

      el.savedLeft = parseInt(left); // so we don’t have to use offsetLeft
      el.savedNoMoveLeft = parseInt(noMoveLeft); // so we don’t have to use offsetLeft
      el.savedWidth = parseInt(width);

      left += width;
      noMoveLeft += width;

      if (el == draggingMove.segmentAfterEl) {
        left += DRAGGING_MOVE_HOLE_WIDTH;
        extraWidth += DRAGGING_MOVE_HOLE_WIDTH;

        if (!draggingMove.segmentBeforeEl) {
          left += DRAGGING_MOVE_HOLE_WIDTH;
          extraWidth += DRAGGING_MOVE_HOLE_WIDTH;
        }
      }
    }

    var occupiedWidth = left;
    var noMoveOccupiedWidth = noMoveLeft;

    var mainLeft = Math.round((street.width * TILE_SIZE - occupiedWidth) / 2);
    var mainNoMoveLeft = Math.round((street.width * TILE_SIZE - noMoveOccupiedWidth) / 2);

    for (var i in street.segments) {
      var el = street.segments[i].el;

      el.savedLeft += mainLeft;
      el.savedNoMoveLeft += mainNoMoveLeft;

      if (system.cssTransform) {
        el.style[system.cssTransform] = 'translateX(' + el.savedLeft + 'px)';
        el.cssTransformLeft = el.savedLeft;
      } else {
        el.style.left = el.savedLeft + 'px';
      }
    }

    if (system.cssTransform) {
      document.querySelector('#street-section-left-empty-space').
          style[system.cssTransform] = 'translateX(' + (-extraWidth / 2) + 'px)';
      document.querySelector('#street-section-right-empty-space').
          style[system.cssTransform] = 'translateX(' + (extraWidth / 2) + 'px)';
    } else {
      document.querySelector('#street-section-left-empty-space').
          style.marginLeft = -(extraWidth / 2) + 'px';
      document.querySelector('#street-section-right-empty-space').
          style.marginLeft = (extraWidth / 2) + 'px';      
    }
  }

  function _applyWarningsToSegments() {
      //console.log('warnings');
    for (var i in street.segments) {
      var segment = street.segments[i];

      //console.log(segment);

      if (segment.el) {
        if (segment.warnings[SEGMENT_WARNING_OUTSIDE] || 
            segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] ||
            segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE]) {
          segment.el.classList.add('warning');          
        } else {
          segment.el.classList.remove('warning');                    
        }

        if (segment.warnings[SEGMENT_WARNING_OUTSIDE]) {
          segment.el.classList.add('outside');
        } else {
          segment.el.classList.remove('outside');
        }
      }
      _infoBubble.updateWarningsInContents(segment);
    }
  }

  function _recalculateWidth() {
    street.occupiedWidth = 0;

    for (var i in street.segments) {
      var segment = street.segments[i];

      street.occupiedWidth += segment.width;
    }   

    street.remainingWidth = street.width - street.occupiedWidth;
    // Rounding problems :·(
    if (Math.abs(street.remainingWidth) < WIDTH_ROUNDING) {
      street.remainingWidth = 0;
    }

    var position = street.width / 2 - street.occupiedWidth / 2;

    for (var i in street.segments) {
      var segment = street.segments[i];
      var segmentInfo = SEGMENT_INFO[segment.type];
      var variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString];

      if (segment.el) {
        if ((street.remainingWidth < 0) && 
            ((position < 0) || ((position + segment.width) > street.width))) {
          segment.warnings[SEGMENT_WARNING_OUTSIDE] = true;
        } else {
          segment.warnings[SEGMENT_WARNING_OUTSIDE] = false;
        }

        if (variantInfo.minWidth && (segment.width < variantInfo.minWidth)) {
          segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = true;
        } else {
          segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] = false;          
        }

        if (variantInfo.maxWidth && (segment.width > variantInfo.maxWidth)) {
          segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = true;
        } else {
          segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE] = false;          
        }
      }

      position += street.segments[i].width;
    }

    var lastOverflow = document.body.classList.contains('street-overflows');

    if (street.remainingWidth >= 0) {
      document.body.classList.remove('street-overflows');
    } else {
      document.body.classList.add('street-overflows');
    }

    if (lastOverflow != document.body.classList.contains('street-overflows')) {
      _createBuildings();
    }

    _repositionEmptySegments();

    _applyWarningsToSegments();
  }

  function _hideEmptySegment(position) {
    document.querySelector('#street-section-' + position + '-empty-space').
        classList.remove('visible');
  }

  function _showEmptySegment(position, width) {
    document.querySelector('#street-section-' + position + '-empty-space .width').innerHTML = 
        _prettifyWidth(width / TILE_SIZE, PRETTIFY_WIDTH_OUTPUT_MARKUP);
    document.querySelector('#street-section-' + position + '-empty-space').
        classList.add('visible');

    if (position == 'right') {
      width--; // So that the rules align
    }
    document.querySelector('#street-section-' + position + '-empty-space').
        style.width = width + 'px';
  }

  function _repositionEmptySegments() {
    if (street.remainingWidth <= 0) {
      _hideEmptySegment('left');
      _hideEmptySegment('right');
    } else {
      if (!street.occupiedWidth) {
        var width = street.remainingWidth * TILE_SIZE;
        _showEmptySegment('left', width);
        _hideEmptySegment('right');
      } else {
        var width = street.remainingWidth / 2 * TILE_SIZE;
        _showEmptySegment('left', width);
        _showEmptySegment('right', width);
      }
    }
  }

  function _segmentsChanged() {
    if (!initializing) {
      _createDataFromDom();
    }

    _recalculateWidth();
    _recalculateOwnerWidths();

    for (var i in street.segments) {
      if (street.segments[i].el) {
        street.segments[i].el.dataNo = i;
      }
    }

    _saveStreetToServerIfNecessary();
    _updateUndoButtons();
    _repositionSegments();
  }

  function _updateEverything(dontScroll) {
    ignoreStreetChanges = true;
    _propagateUnits();
    _buildStreetWidthMenu();
    _updateShareMenu();
    _createDomFromData();
    _segmentsChanged();
    _resizeStreetWidth(dontScroll);
    _updateStreetName();
    ignoreStreetChanges = false;
    _updateUndoButtons();
    lastStreet = _trimStreetData(street);

    _scheduleSavingStreetToServer();
  }

  function _undoRedo(undo) {
    if (undo && !_isUndoAvailable()) {
      _statusMessage.show(msg('STATUS_NOTHING_TO_UNDO'));
    } else if (!undo && !_isRedoAvailable()) {
      _statusMessage.show(msg('STATUS_NOTHING_TO_REDO'));
    } else {
      if (undo) {
        undoStack[undoPosition] = _trimStreetData(street);
        undoPosition--;
      } else {
        undoPosition++;
      }
      street = _clone(undoStack[undoPosition]);
      _setUpdateTimeToNow();

      _infoBubble.hide();
      _infoBubble.hideSegment();
      _infoBubble.dontConsiderShowing();

      _updateEverything(true);
      _statusMessage.hide();
    }
  }

  function _clearUndoStack() {
    undoStack = [];
    undoPosition = 0;
    _updateUndoButtons();
  }

  function _undo() {
    _undoRedo(true);
  }

  function _redo() {
    _undoRedo(false);
  }

  function _trimUndoStack() {
    // TODO optimize
    while (undoPosition >= UNDO_LIMIT) {
      undoPosition--;
      undoStack = undoStack.slice(1);
    }
  }

  function _createNewUndo() {
    // This removes future undo path in case we undo a few times and then do
    // something undoable.
    undoStack = undoStack.splice(0, undoPosition);
    undoStack[undoPosition] = _clone(lastStreet);
    undoPosition++;

    _trimUndoStack();
    _unifyUndoStack();
  }

  function _createNewUndoIfNecessary(lastStreet, currentStreet) {
    if (lastStreet.name != currentStreet.name) {
      return;
    }

    _createNewUndo();
  }

  function _incrementSchemaVersion(street) {
    if (!street.schemaVersion) {
      street.schemaVersion = 1;
    }

    switch (street.schemaVersion) {
      case 1:
        street.leftBuildingHeight = DEFAULT_BUILDING_HEIGHT_LEFT;
        street.rightBuildingHeight = DEFAULT_BUILDING_HEIGHT_RIGHT;
        break;
      case 2:
        street.leftBuildingVariant = DEFAULT_BUILDING_VARIANT_LEFT;
        street.rightBuildingVariant = DEFAULT_BUILDING_VARIANT_RIGHT;
        break;
      case 3:
        for (var i in street.segments) {
          var segment = street.segments[i];
          if (segment.type == 'transit-shelter') {
            var variant = _getVariantArray(segment.type, segment.variantString);
            variant['transit-shelter-elevation'] = 'street-level';
            segment.variantString = _getVariantString(variant);
          }
        }
        break;
      case 4:
        for (var i in street.segments) {
          var segment = street.segments[i];
          if (segment.type == 'sidewalk-lamp') {
            var variant = _getVariantArray(segment.type, segment.variantString);
            variant['lamp-type'] = 'modern';
            segment.variantString = _getVariantString(variant);
          }
        }
        break;
      case 5:
        for (var i in street.segments) {
          var segment = street.segments[i];
          if (segment.type == 'streetcar') {
            var variant = _getVariantArray(segment.type, segment.variantString);
            variant['public-transit-asphalt'] = 'regular';
            segment.variantString = _getVariantString(variant);
          }
        }
        break;
      case 6:
        for (var i in street.segments) {
          var segment = street.segments[i];
          if ((segment.type == 'bus-lane') || (segment.type == 'light-rail')) {
            var variant = _getVariantArray(segment.type, segment.variantString);
            variant['public-transit-asphalt'] = 'regular';
            segment.variantString = _getVariantString(variant);
          }
        }
        break;
      case 7:
        for (var i in street.segments) {
          var segment = street.segments[i];
          if (segment.type == 'bike-lane') {
            var variant = _getVariantArray(segment.type, segment.variantString);
            variant['bike-asphalt'] = 'regular';
            segment.variantString = _getVariantString(variant);
          }
        }
        break;
      case 8:
        for (var i in street.segments) {
          var segment = street.segments[i];
          if (segment.type == 'drive-lane') {
            var variant = _getVariantArray(segment.type, segment.variantString);
            variant['car-type'] = 'car';
            segment.variantString = _getVariantString(variant);
          }
        }
        break;
      case 9:
        for (var i in street.segments) {
          var segment = street.segments[i];
          if (segment.type == 'sidewalk') {
            var variant = _getVariantArray(segment.type, segment.variantString);
            variant['sidewalk-density'] = 'normal';
            segment.variantString = _getVariantString(variant);
          }
        }
        break;
      case 10:
        for (var i in street.segments) {
          var segment = street.segments[i];
          if (segment.type == 'planting-strip') {
            segment.type = 'divider';

            if (segment.variantString == '') {
              segment.variantString = 'planting-strip';
            };
          } else if (segment.type == 'small-median') {
            segment.type = 'divider';
            segment.variantString = 'median';
          }
        }
        break;
      case 11:
        for (var i in street.segments) {
          var segment = street.segments[i];
          if (segment.type == 'divider') {
            if (segment.variantString == 'small-tree') {
              segment.variantString = 'big-tree';
            };
          } else if (segment.type == 'sidewalk-tree') {
            if (segment.variantString == 'small') {
              segment.variantString = 'big';
            };
          }
        }
        break;
      case 12:
        for (var i in street.segments) {
          var segment = street.segments[i];
          if (segment.type == 'sidewalk-bike-rack') {
            var variant = _getVariantArray(segment.type, segment.variantString);
            variant['bike-rack-elevation'] = 'sidewalk';
            segment.variantString =  _getVariantString(variant);
          }
        }
        break;
    }

    street.schemaVersion++;
  }

  function _updateToLatestSchemaVersion(street) {
    var updated = false;
    while (!street.schemaVersion || (street.schemaVersion < LATEST_SCHEMA_VERSION)) {
      //console.log('updating schema from', street.schemaVersion);

      _incrementSchemaVersion(street);
      updated = true;
    }

    return updated;
  }

  function _unpackStreetDataFromServerTransmission(transmission) {
    var street = _clone(transmission.data.street);

    street.creatorId = (transmission.creator && transmission.creator.id) || null;
    street.originalStreetId = transmission.originalStreetId || null;
    street.updatedAt = transmission.updatedAt || null;
    street.name = transmission.name || DEFAULT_NAME;

    return street;
  }

  function _unpackServerStreetData(transmission, id, namespacedId, checkIfNeedsToBeRemixed) {
    //console.log('unpack server street data', transmission);

    street = _unpackStreetDataFromServerTransmission(transmission);

    undoStack = _clone(transmission.data.undoStack);
    undoPosition = transmission.data.undoPosition;

    var updatedSchema = _updateToLatestSchemaVersion(street);
    for (var i = 0; i < undoStack.length; i++) {
      if (_updateToLatestSchemaVersion(undoStack[i])) {
        updatedSchema = true;
      }
    }

    if (id) {
      _setStreetId(id, namespacedId);
    } else {
      _setStreetId(transmission.id, transmission.namespacedId);
    }

    if (checkIfNeedsToBeRemixed) {
      if (!signedIn || (street.creatorId != signInData.userId)) {
        remixOnFirstEdit = true;
      } else {
        remixOnFirstEdit = false;
      }

      if (updatedSchema && !remixOnFirstEdit) {
        //console.log('saving because of updated schema…');
        _saveStreetToServer();
      }
    }
  }

  function _packServerStreetData() {
    var data = {};

    data.street = _trimStreetData(street);

    // Those go above data in the structure, so they need to be cleared here
    delete data.street.name;
    delete data.street.originalStreetId;
    delete data.street.updatedAt;

    // This will be implied through authorization header
    delete data.street.creatorId;

    data.undoStack = _clone(undoStack);
    data.undoPosition = undoPosition;

    var transmission = {
      name: street.name,
      originalStreetId: street.originalStreetId,
      data: data
    }

    return JSON.stringify(transmission);
  }

  function _getNonblockingAjaxRequestCount() {
    return nonblockingAjaxRequests.length;
  }

  function _getAjaxRequestSignature(request) {
    return request.type + ' ' + request.url;
  }

  function _newNonblockingAjaxRequest(request, allowToClosePage, doneFunc, errorFunc) {
    nonblockingAjaxRequestTimer = 0;

    var signature = _getAjaxRequestSignature(request);

    _removeNonblockingAjaxRequest(signature);
    nonblockingAjaxRequests.push( 
      { request: request, allowToClosePage: allowToClosePage, 
        doneFunc: doneFunc, errorFunc: errorFunc,
        signature: signature }
    );

    _scheduleNextNonblockingAjaxRequest();
  }

  function _nonblockingAjaxTryAgain() {
    _noConnectionMessage.hide();

    nonblockingAjaxRequestTimer = 0;

    _scheduleNextNonblockingAjaxRequest();
  }

  function _sendNextNonblockingAjaxRequest() {
    if (abortEverything) {
      return;
    }

    if (_getNonblockingAjaxRequestCount()) {
      _noConnectionMessage.schedule();        

      var request = null;

      request = nonblockingAjaxRequests[0];

      if (request) {
        var query = jQuery.ajax(request.request).done(function(data) {
          _successNonblockingAjaxRequest(data, request);
        }).fail(function(data) {
          _errorNonblockingAjaxRequest(data, request);
        });
      }
      
      _scheduleNextNonblockingAjaxRequest();
    }
  }

  function _scheduleNextNonblockingAjaxRequest() {
    if (_getNonblockingAjaxRequestCount()) {
      if (nonblockingAjaxRequestTimer < NON_BLOCKING_AJAX_REQUEST_TIME.length) {
        var time = NON_BLOCKING_AJAX_REQUEST_TIME[nonblockingAjaxRequestTimer];
      } else {
        var time = Math.floor(Math.random() * NON_BLOCKING_AJAX_REQUEST_BACKOFF_RANGE);
      }

      window.setTimeout(_sendNextNonblockingAjaxRequest, time);

      nonblockingAjaxRequestTimer++;
    } else {
      saveStreetIncomplete = false;
    }
  }

  function _removeNonblockingAjaxRequest(signature) {
    for (var i in nonblockingAjaxRequests) {
      if (nonblockingAjaxRequests[i].signature == signature) {
        nonblockingAjaxRequests.splice(i, 1);
        break;
      }
    }    
  }

  function _errorNonblockingAjaxRequest(data, request) {
    if (request.errorFunc) {
      request.errorFunc(data);
    }    
  }

  function _successNonblockingAjaxRequest(data, request) {
    nonblockingAjaxRequestTimer = 0;

    _noConnectionMessage.hide();

    _removeNonblockingAjaxRequest(request.signature);

    if (request.doneFunc) {
      request.doneFunc(data);
    }

    _scheduleNextNonblockingAjaxRequest();
  }

  function _saveStreetToServer(initial) {
    //console.log('save street to server…');

    var transmission = _packServerStreetData();

    if (initial) {
      // blocking

      jQuery.ajax({
        // TODO const
        url: API_URL + 'v1/streets/' + street.id,
        data: transmission,
        dataType: 'json',
        type: 'PUT',
        contentType: 'application/json',
        headers: { 'Authorization': _getAuthHeader() }
      }).done(_confirmSaveStreetToServerInitial);
    } else {
      _newNonblockingAjaxRequest({
        // TODO const
        url: API_URL + 'v1/streets/' + street.id,
        data: transmission,
        dataType: 'json',
        type: 'PUT',
        contentType: 'application/json',
        headers: { 'Authorization': _getAuthHeader() }
      }, false);
    }
  }

  function _confirmSaveStreetToServerInitial() {
    saveStreetIncomplete = false;

    serverContacted = true;
    _checkIfEverythingIsLoaded();
  }


  function _saveSettingsToServer() {
    if (!signedIn || abortEverything) {
      return;
    }

    var transmission = JSON.stringify({ data: _trimSettings() });

    _newNonblockingAjaxRequest({
      // TODO const
      url: API_URL + 'v1/users/' + signInData.userId,
      data: transmission,
      dataType: 'json',
      type: 'PUT',
      contentType: 'application/json',
      headers: { 'Authorization': _getAuthHeader() }
    }, true, null, _errorSavingSettingsToServer);

//      function _newNonblockingAjaxRequest(request, allowToClosePage, doneFunc, errorFunc) {
  }

  function _errorSavingSettingsToServer(data) {
    if (!abortEverything && (data.status == 401)) {
      mode = MODE_FORCE_RELOAD_SIGN_OUT_401;
      _processMode();
    }
  }

  function _clearScheduledSavingStreetToServer() {
    window.clearTimeout(saveStreetTimerId);
  }

  function _clearScheduledSavingSettingsToServer() {
    window.clearTimeout(saveSettingsTimerId);
  }

  function _successBlockingAjaxRequest(data) {
    _hideBlockingShield();

    blockingAjaxRequestInProgress = false;

    blockingAjaxRequestDoneFunc(data);
  }

  function _errorBlockingAjaxRequest() {
    if (blockingAjaxRequestCancelFunc) {
      document.querySelector('#blocking-shield').classList.add('show-cancel');      
    }

    document.querySelector('#blocking-shield').classList.add('show-try-again');

    _darkenBlockingShield();
  }

  function _blockingTryAgain() {
    document.querySelector('#blocking-shield').classList.remove('show-try-again');
    document.querySelector('#blocking-shield').classList.remove('show-cancel');

    jQuery.ajax(blockingAjaxRequest).
        done(_successBlockingAjaxRequest).fail(_errorBlockingAjaxRequest);
  }

  function _blockingCancel() {
    _hideBlockingShield();

    blockingAjaxRequestInProgress = false;

    blockingAjaxRequestCancelFunc();
  }

  function _newBlockingAjaxRequest(message, request, doneFunc, cancelFunc) {
    _showBlockingShield(message);

    blockingAjaxRequestInProgress = true;

    blockingAjaxRequest = request;
    blockingAjaxRequestDoneFunc = doneFunc;
    blockingAjaxRequestCancelFunc = cancelFunc;

    jQuery.ajax(blockingAjaxRequest).
        done(_successBlockingAjaxRequest).fail(_errorBlockingAjaxRequest);
  }

  function _remixStreet() {
    remixOnFirstEdit = false;

    if (signedIn) {
      _setStreetCreatorId(signInData.userId);
    } else {
      _setStreetCreatorId(null);
    }

    street.originalStreetId = street.id;

    _unifyUndoStack();

    if (undoStack[undoPosition - 1] && (undoStack[undoPosition - 1].name != street.name)) {
      // The street was remixed as a result of editing its name. Don’t be
      // a douche and add (remixed) to it then.
      var dontAddSuffix = true;
    } else {
      var dontAddSuffix = false;
    }

    if (!promoteStreet && !dontAddSuffix) {
      _addRemixSuffixToName();
    }

    var transmission = _packServerStreetData();

    _newBlockingAjaxRequest(msg('BLOCKING_REMIXING'), 
        {
          // TODO const
          url: API_URL + 'v1/streets',
          type: 'POST',
          data: transmission,
          dataType: 'json',
          contentType: 'application/json',
          headers: { 'Authorization': _getAuthHeader() }
        }, _receiveRemixedStreet
    );
  }

  function _updateLastStreetInfo() {
    //console.log('update');

    settings.lastStreetId = street.id;
    settings.lastStreetNamespacedId = street.namespacedId;
    settings.lastStreetCreatorId = street.creatorId;

    _saveSettingsLocally();
  }

  function _unifyUndoStack() {
    //console.log('_unifyUndoStack…', street.creatorId);
    for (var i = 0; i < undoStack.length; i++) {
      undoStack[i].id = street.id;
      undoStack[i].name = street.name;
      undoStack[i].namespacedId = street.namespacedId;
      undoStack[i].creatorId = street.creatorId;
      undoStack[i].updatedAt = street.updatedAt; 
      //console.log(i, undoStack[i].creatorId);
    }

    /*console.log('***');
    for (var i = 0; i < undoStack.length; i++) {
      console.log(undoStack[i]);
      console.log(undoStack[i].creatorId);
    }*/
  }

  function _setStreetId(newId, newNamespacedId) {
    street.id = newId;
    street.namespacedId = newNamespacedId;

    _unifyUndoStack();

    _updateLastStreetInfo();
  }

  function _setStreetCreatorId(newId) {
    //console.log('setStreetCreatorId', newId);
    street.creatorId = newId;

    _unifyUndoStack();
    _updateLastStreetInfo();
  }

  function _addRemixSuffixToName() {
    // Removed for the time being to see if we like it without this.
    return;

    if (street.name.substr(street.name.length - STREET_NAME_REMIX_SUFFIX.length, 
        STREET_NAME_REMIX_SUFFIX.length) != STREET_NAME_REMIX_SUFFIX) {
      street.name += ' ' + STREET_NAME_REMIX_SUFFIX;
    }
  }

  function _receiveRemixedStreet(data) {
    if (!promoteStreet) {
      if (signedIn) {
        _statusMessage.show(msg('STATUS_NOW_REMIXING'));
      } else {
        _statusMessage.show(msg('STATUS_NOW_REMIXING_SIGN_IN', { signInUrl: URL_SIGN_IN_REDIRECT }));
      }
    }

    _setStreetId(data.id, data.namespacedId);
    _updateStreetName();

    _saveStreetToServer(false);
  }

  function _scheduleSavingStreetToServer() {
    //console.log('schedule save…');

    saveStreetIncomplete = true;

    _clearScheduledSavingStreetToServer();

    if (remixOnFirstEdit) {
      _remixStreet();
    } else {
      saveStreetTimerId = 
          window.setTimeout(function() { _saveStreetToServer(false); }, SAVE_STREET_DELAY);
    }
  }

  function _scheduleSavingSettingsToServer() {
    if (!signedIn) {
      return;
    }

    _clearScheduledSavingSettingsToServer();

    saveSettingsTimerId = 
        window.setTimeout(function() { _saveSettingsToServer(); }, SAVE_SETTINGS_DELAY);
  }

  function _setUpdateTimeToNow() {
    //console.log('SET TO NOW');

    street.updatedAt = new Date().getTime();
    _unifyUndoStack();
    _updateStreetMetadata();
  }

  function _saveStreetToServerIfNecessary() {
    if (ignoreStreetChanges || abortEverything) {
      return;
    }

    var currentData = _trimStreetData(street);

    if (JSON.stringify(currentData) != JSON.stringify(lastStreet)) {
      _setUpdateTimeToNow();
      _hideNewStreetMenu();

      // As per issue #306.
      _statusMessage.hide();

      //_hideStreetAttribution();
      _updateStreetMetadata();

      _createNewUndoIfNecessary(lastStreet, currentData);
      _scheduleSavingStreetToServer();

      lastStreet = currentData;

      _updateUndoButtons();
    }
  }

  function _checkIfChangesSaved() {
    // don’t do for settings deliberately

    if (abortEverything) {
      return null;
    }

    var showWarning = false;

    if (saveStreetIncomplete) {
      showWarning = true;
    } else for (var i in nonblockingAjaxRequests) {
      if (!nonblockingAjaxRequests[i].allowToClosePage) {
        showWarning = true;
      }
    }

    if (showWarning) {
      nonblockingAjaxRequestTimer = 0;
      _scheduleNextNonblockingAjaxRequest();

      return 'Your changes have not been saved yet. Please return to the page, check your Internet connection, and wait a little while to allow the changes to be saved.';
    } else {
      return null;
    }
  }

  function _onWindowBeforeUnload() {
    return _checkIfChangesSaved();
  }

  function _getVariantArray(segmentType, variantString) {
    var variantArray = {};
    var variantSplit = variantString.split(VARIANT_SEPARATOR);

    for (var i in SEGMENT_INFO[segmentType].variants) {
      var variantName = SEGMENT_INFO[segmentType].variants[i];

      variantArray[variantName] = variantSplit[i];
    }

    return variantArray;
  }

  // Copies only the data necessary for save/undo.
  function _trimStreetData(street) {
    var newData = {};

    newData.schemaVersion = street.schemaVersion;

    newData.width = street.width;
    newData.name = street.name;

    newData.id = street.id;
    newData.namespacedId = street.namespacedId;
    newData.creatorId = street.creatorId;
    newData.originalStreetId = street.originalStreetId;
    newData.units = street.units;

    newData.leftBuildingHeight = street.leftBuildingHeight;
    newData.rightBuildingHeight = street.rightBuildingHeight;
    newData.leftBuildingVariant = street.leftBuildingVariant;
    newData.rightBuildingVariant = street.rightBuildingVariant;

    newData.segments = [];

    for (var i in street.segments) {
      var segment = {};
      segment.type = street.segments[i].type;
      segment.variantString = street.segments[i].variantString;
      segment.width = street.segments[i].width;

      newData.segments.push(segment);
    }

    return newData;
  }  

  // TODO this function should not exist; all the data should be in street. 
  // object to begin with
  function _createDataFromDom() {
    var els = document.querySelectorAll('#street-section-editable > .segment');

    street.segments = [];

    for (var i = 0, el; el = els[i]; i++) {
      var segment = {};
      segment.type = el.getAttribute('type');
      segment.variantString = el.getAttribute('variant-string');
      segment.variant = _getVariantArray(segment.type, segment.variantString);
      segment.width = parseFloat(el.getAttribute('width'));
      segment.el = el;
      segment.warnings = [];
      street.segments.push(segment);
    }
  }

  function _drawLine(ctx, x1, y1, x2, y2) {
    x1 *= system.hiDpi;
    y1 *= system.hiDpi;
    x2 *= system.hiDpi;
    y2 *= system.hiDpi;

    ctx.beginPath(); 
    ctx.moveTo(x1, y1); 
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function _drawArrowLine(ctx, x1, y1, x2, y2, text) {
    x1 += 2;
    x2 -= 2;

    _drawLine(ctx, x1, y1, x2, y2);

    if (text) {
      ctx.font = (12 * system.hiDpi) + 'px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(text, (x1 + x2) / 2 * system.hiDpi, y1 * system.hiDpi - 10);      
    }
  }

  function _updateWidthChart(ownerWidths) {
    var ctx = document.querySelector('#width-chart').getContext('2d');

    var chartWidth = WIDTH_CHART_WIDTH;
    var canvasWidth = document.querySelector('#width-chart').offsetWidth;
    var canvasHeight = document.querySelector('#width-chart').offsetHeight;

    document.querySelector('#width-chart').width = canvasWidth * system.hiDpi;
    document.querySelector('#width-chart').height = canvasHeight * system.hiDpi;

    chartWidth -= WIDTH_CHART_MARGIN * 2;

    var left = (canvasWidth - chartWidth) / 2;

    for (var id in SEGMENT_OWNERS) {
      if (ownerWidths[id] == 0) {
        chartWidth -= WIDTH_CHART_EMPTY_OWNER_WIDTH;
      }
    }

    var maxWidth = street.width;
    if (street.occupiedWidth > street.width) {
      maxWidth = street.occupiedWidth;
    }

    var multiplier = chartWidth / maxWidth;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    var bottom = 70;

    _drawLine(ctx, left, 20, left, bottom);
    if (maxWidth > street.width) {
      _drawLine(ctx, left + street.width * multiplier, 20, 
          left + street.width * multiplier, 40);

      ctx.save();
      // TODO const
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'red';
      _drawArrowLine(ctx, 
        left + street.width * multiplier, 30, 
        left + maxWidth * multiplier, 30, 
        _prettifyWidth(-street.remainingWidth, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP));
      ctx.restore();
    }

    _drawLine(ctx, left + maxWidth * multiplier, 20, 
        left + maxWidth * multiplier, bottom);
    _drawArrowLine(ctx, 
        left, 30, left + street.width * multiplier, 30, 
        _prettifyWidth(street.width, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP));
  
    var x = left;

    for (var id in SEGMENT_OWNERS) {
      if (ownerWidths[id] > 0) {
        var width = ownerWidths[id] * multiplier;

        _drawArrowLine(ctx, x, 60, x + width, 60, 
            _prettifyWidth(ownerWidths[id], PRETTIFY_WIDTH_OUTPUT_NO_MARKUP));
        _drawLine(ctx, x + width, 50, x + width, 70);

        var imageWidth = images[SEGMENT_OWNERS[id].imageUrl].width / 5 * SEGMENT_OWNERS[id].imageSize;
        var imageHeight = images[SEGMENT_OWNERS[id].imageUrl].height / 5 * SEGMENT_OWNERS[id].imageSize;

        ctx.drawImage(images[SEGMENT_OWNERS[id].imageUrl], 
            0, 
            0, 
            images[SEGMENT_OWNERS[id].imageUrl].width, 
            images[SEGMENT_OWNERS[id].imageUrl].height, 
            (x + width / 2 - imageWidth / 2) * system.hiDpi, 
            (80 - imageHeight) * system.hiDpi,
            imageWidth * system.hiDpi, 
            imageHeight * system.hiDpi);

        x += width;
      }
    }

    if (street.remainingWidth > 0) {
      ctx.save();
      // TODO const
      ctx.strokeStyle = 'rgb(100, 100, 100)';
      ctx.fillStyle = 'rgb(100, 100, 100)';
      if (ctx.setLineDash) {
        ctx.setLineDash([15, 10]);
      }
      _drawArrowLine(ctx, x, 60, left + street.width * multiplier, 60, _prettifyWidth(street.remainingWidth, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP));
      ctx.restore();
    }

    x = left + maxWidth * multiplier;

    for (var id in SEGMENT_OWNERS) {
      if (ownerWidths[id] == 0) {
        var width = WIDTH_CHART_EMPTY_OWNER_WIDTH;

        ctx.fillStyle = 'rgb(100, 100, 100)';
        ctx.strokeStyle = 'rgb(100, 100, 100)';

        _drawArrowLine(ctx, x, 60, x + width, 60, '–');
        _drawLine(ctx, x + width, 50, x + width, 70);

        var imageWidth = images[SEGMENT_OWNERS[id].imageUrl].width / 5 * SEGMENT_OWNERS[id].imageSize;
        var imageHeight = images[SEGMENT_OWNERS[id].imageUrl].height / 5 * SEGMENT_OWNERS[id].imageSize;

        ctx.save();
        ctx.globalAlpha = .5;
        ctx.drawImage(images[SEGMENT_OWNERS[id].imageUrl], 
            0, 
            0, 
            images[SEGMENT_OWNERS[id].imageUrl].width, 
            images[SEGMENT_OWNERS[id].imageUrl].height, 
            (x + width / 2 - imageWidth / 2) * system.hiDpi, 
            (80 - imageHeight) * system.hiDpi,
            imageWidth * system.hiDpi, 
            imageHeight * system.hiDpi);
        ctx.restore();
        
        x += width;
      }
    }

    /*document.querySelector('#street-width-canvas').style.left = 
        WIDTH_CHART_MARGIN + 'px';
    document.querySelector('#street-width-canvas').style.width = 
        (street.width * multiplier) + 'px';*/
  }

  // TODO move
  var widthChartShowTimerId = -1;
  var widthChartHideTimerId = -1;

  function _showWidthChartImmediately() {
    return;

    document.querySelector('.width-chart-canvas').classList.add('visible');    
  }

  function _showWidthChart() {
    window.clearTimeout(widthChartHideTimerId);
    window.clearTimeout(widthChartShowTimerId);

    // TODO const
    widthChartShowTimerId = window.setTimeout(_showWidthChartImmediately, 750);
  }

  function _hideWidthChartImmediately() {
    document.querySelector('.width-chart-canvas').classList.remove('visible');
  }

  function _hideWidthChart() {
    window.clearTimeout(widthChartHideTimerId);
    window.clearTimeout(widthChartShowTimerId);

    // TODO const
    widthChartHideTimerId = window.setTimeout(_hideWidthChartImmediately, 2000);
  }

  function _recalculateOwnerWidths() {
    var ownerWidths = {};

    for (var id in SEGMENT_OWNERS) {
      ownerWidths[id] = 0;
    }

    for (var i in street.segments) {
      var segment = street.segments[i];

      ownerWidths[SEGMENT_INFO[segment.type].owner] += segment.width;
    }   

    _updateWidthChart(ownerWidths);
  }

  function _changeDraggingType(newDraggingType) {
    draggingType = newDraggingType;

    document.body.classList.remove('segment-move-dragging');
    document.body.classList.remove('segment-resize-dragging');

    switch (draggingType) {
      case DRAGGING_TYPE_RESIZE:
        document.body.classList.add('segment-resize-dragging');
        break;
      case DRAGGING_TYPE_MOVE:
        document.body.classList.add('segment-move-dragging');
        break;
    }
  }

  function _handleSegmentResizeStart(event) {
    ignoreStreetChanges = true;

    var el = event.target;

    _changeDraggingType(DRAGGING_TYPE_RESIZE);

    var pos = _getElAbsolutePos(el);

    draggingResize.right = el.classList.contains('right');

    draggingResize.floatingEl = document.createElement('div');
    draggingResize.floatingEl.classList.add('drag-handle');
    draggingResize.floatingEl.classList.add('floating');

    if (el.classList.contains('left')) {
      draggingResize.floatingEl.classList.add('left');
    } else {
      draggingResize.floatingEl.classList.add('right');      
    }

    draggingResize.floatingEl.style.left = (pos[0] - document.querySelector('#street-section-outer').scrollLeft) + 'px';
    draggingResize.floatingEl.style.top = pos[1] + 'px';
    document.body.appendChild(draggingResize.floatingEl);

    draggingResize.mouseX = event.pageX;
    draggingResize.mouseY = event.pageY;

    draggingResize.elX = pos[0];
    draggingResize.elY = pos[1];

    draggingResize.originalX = draggingResize.elX;
    draggingResize.originalWidth = parseFloat(el.segmentEl.getAttribute('width'));
    draggingResize.segmentEl = el.segmentEl;

    draggingResize.segmentEl.classList.add('hover');

    var segmentInfo = SEGMENT_INFO[el.segmentEl.getAttribute('type')];
    var variantInfo = SEGMENT_INFO[el.segmentEl.getAttribute('type')].details[el.segmentEl.getAttribute('variant-string')];

    if (variantInfo.minWidth) {
      var guideEl = document.createElement('div');
      guideEl.classList.add('guide');
      guideEl.classList.add('min');

      var width = variantInfo.minWidth * TILE_SIZE;
      guideEl.style.width = width + 'px';
      guideEl.style.marginLeft = (-width / 2) + 'px';
      el.segmentEl.appendChild(guideEl);
    }

    var remainingWidth = 
        street.remainingWidth + parseFloat(el.segmentEl.getAttribute('width'));

    if (remainingWidth && 
        (((!variantInfo.minWidth) && (remainingWidth >= MIN_SEGMENT_WIDTH)) || (remainingWidth >= variantInfo.minWidth)) && 
        ((!variantInfo.maxWidth) || (remainingWidth <= variantInfo.maxWidth))) {
      var guideEl = document.createElement('div');
      guideEl.classList.add('guide');
      guideEl.classList.add('max');

      var width = remainingWidth * TILE_SIZE;
      guideEl.style.width = width + 'px';
      guideEl.style.marginLeft = (-width / 2) + 'px';
      el.segmentEl.appendChild(guideEl);
    } else if (variantInfo.maxWidth) {
      var guideEl = document.createElement('div');
      guideEl.classList.add('guide');
      guideEl.classList.add('max');

      var width = variantInfo.maxWidth * TILE_SIZE;
      guideEl.style.width = width + 'px';
      guideEl.style.marginLeft = (-width / 2) + 'px';
      el.segmentEl.appendChild(guideEl);
    }

    _infoBubble.hide();
    _infoBubble.hideSegment(true);

    el.segmentEl.classList.add('hover');

    _showWidthChartImmediately();
  }

  function _handleSegmentResizeMove(event) {
    var x = event.pageX;
    var y = event.pageY;

    var deltaX = x - draggingResize.mouseX;
    var deltaY = y - draggingResize.mouseY;

    var deltaFromOriginal = draggingResize.elX - draggingResize.originalX;
    if (!draggingResize.right) {
      deltaFromOriginal = -deltaFromOriginal;
    }

    draggingResize.elX += deltaX;
    draggingResize.floatingEl.style.left = (draggingResize.elX - document.querySelector('#street-section-outer').scrollLeft) + 'px';

    var width = draggingResize.originalWidth + deltaFromOriginal / TILE_SIZE * 2;
    var precise = event.shiftKey;

    if (precise) {
      var resizeType = RESIZE_TYPE_PRECISE_DRAGGING;
    } else {
      var resizeType = RESIZE_TYPE_DRAGGING;
    }

    _resizeSegment(draggingResize.segmentEl, resizeType,
        width * TILE_SIZE, true, false, true);

    draggingResize.mouseX = event.pageX;
    draggingResize.mouseY = event.pageY;

    // TODO hack so it doesn’t disappear
    _showWidthChartImmediately();
  }  

  function _handleSegmentMoveStart(event) {
    ignoreStreetChanges = true;

    if (event.touches && event.touches[0]) {
      var x = event.touches[0].pageX;
      var y = event.touches[0].pageY;
    } else {
      var x = event.pageX;
      var y = event.pageY;
    }    

    var el = event.target;

    _changeDraggingType(DRAGGING_TYPE_MOVE);

    draggingMove.originalEl = el;

    draggingMove.originalType = draggingMove.originalEl.getAttribute('type');

    if (draggingMove.originalEl.classList.contains('palette')) {
      draggingMove.type = DRAGGING_TYPE_MOVE_CREATE;
      draggingMove.originalWidth = 
          SEGMENT_INFO[draggingMove.originalType].defaultWidth * TILE_SIZE;

      // TODO hack to get the first
      for (var j in SEGMENT_INFO[draggingMove.originalType].details) {
        draggingMove.originalVariantString = j;
        break;
      }
  } else {
      draggingMove.type = DRAGGING_TYPE_MOVE_TRANSFER;      
      draggingMove.originalWidth = 
          draggingMove.originalEl.offsetWidth;
      draggingMove.originalVariantString = 
          draggingMove.originalEl.getAttribute('variant-string');

/*      for (var j in segmentInfo.details) {
        var variantName = j;
        break;
      }*/

    }

    var pos = _getElAbsolutePos(el);

    draggingMove.elX = pos[0];
    draggingMove.elY = pos[1];

    if (draggingMove.type == DRAGGING_TYPE_MOVE_CREATE) {
      draggingMove.elY += DRAG_OFFSET_Y_PALETTE;
      draggingMove.elX -= draggingMove.originalWidth / 3;
    } else {
      draggingMove.elX -= document.querySelector('#street-section-outer').scrollLeft;
    }

    draggingMove.mouseX = x;
    draggingMove.mouseY = y;

    draggingMove.floatingEl = document.createElement('div');
    draggingMove.floatingEl.classList.add('segment');
    draggingMove.floatingEl.classList.add('floating');
    draggingMove.floatingEl.classList.add('first-drag-move');
    draggingMove.floatingEl.setAttribute('type', draggingMove.originalType);
    draggingMove.floatingEl.setAttribute('variant-string', 
        draggingMove.originalVariantString);
    draggingMove.floatingElVisible = false;
    _setSegmentContents(draggingMove.floatingEl, 
        draggingMove.originalType, 
        draggingMove.originalVariantString, 
        draggingMove.originalWidth);
    document.body.appendChild(draggingMove.floatingEl);

    if (system.cssTransform) {
      draggingMove.floatingEl.style[system.cssTransform] = 
          'translate(' + draggingMove.elX + 'px, ' + draggingMove.elY + 'px)';
    } else {
      draggingMove.floatingEl.style.left = draggingMove.elX + 'px';
      draggingMove.floatingEl.style.top = draggingMove.elY + 'px';
    }

    if (draggingMove.type == DRAGGING_TYPE_MOVE_TRANSFER) {
      draggingMove.originalEl.classList.add('dragged-out');
      draggingMove.originalEl.classList.remove('immediate-show-drag-handles');
      draggingMove.originalEl.classList.remove('show-drag-handles');
      draggingMove.originalEl.classList.remove('hover');
    }

    draggingMove.segmentBeforeEl = null;
    draggingMove.segmentAfterEl = null;
    _updateWithinCanvas(true);

    _hideControls();
    _cancelFadeoutControls();

    _infoBubble.hide();
  }

  function _updateWithinCanvas(_newWithinCanvas) {
    draggingMove.withinCanvas = _newWithinCanvas;    

    if (draggingMove.withinCanvas) {
      document.body.classList.remove('not-within-canvas');
    } else {
      document.body.classList.add('not-within-canvas');
    }
  }

  function _handleSegmentMoveMove(event) {
    var x = event.pageX;
    var y = event.pageY;

    var deltaX = x - draggingMove.mouseX;
    var deltaY = y - draggingMove.mouseY;

    draggingMove.elX += deltaX;
    draggingMove.elY += deltaY;

    if (!draggingMove.floatingElVisible) {
      draggingMove.floatingElVisible = true;

      if (system.touch) {
        if (draggingMove.type == DRAGGING_TYPE_MOVE_CREATE) {
          draggingMove.elY += DRAG_OFFSET_Y_TOUCH_PALETTE;
        } else {
          draggingMove.elY += DRAG_OFFSET_Y_TOUCH;
        }
      }

      window.setTimeout(function() {
        draggingMove.floatingEl.classList.remove('first-drag-move');      
      }, SHORT_DELAY);
    }    

    if (system.cssTransform) {
      draggingMove.floatingEl.style[system.cssTransform] = 
          'translate(' + draggingMove.elX + 'px, ' + draggingMove.elY + 'px)';

      var deg = deltaX;

      if (deg > MAX_DRAG_DEGREE) {
        deg = MAX_DRAG_DEGREE;
      } else if (deg < -MAX_DRAG_DEGREE) {
        deg = -MAX_DRAG_DEGREE;
      }

      if (system.cssTransform) {
        draggingMove.floatingEl.querySelector('canvas').style[system.cssTransform] = 
            'rotateZ(' + deg + 'deg)';
      }
    } else {
      draggingMove.floatingEl.style.left = draggingMove.elX + 'px';
      draggingMove.floatingEl.style.top = draggingMove.elY + 'px';
    }

    draggingMove.mouseX = x;
    draggingMove.mouseY = y;

    var newX = x - BUILDING_SPACE + document.querySelector('#street-section-outer').scrollLeft;

    if (_makeSpaceBetweenSegments(newX, y)) {
      var smartDrop = _doDropHeuristics(draggingMove.originalType, 
          draggingMove.originalVariantString, draggingMove.originalWidth);
      
      if ((smartDrop.type != draggingMove.originalType) || (smartDrop.variantString != draggingMove.originalVariantString)) {
        _setSegmentContents(draggingMove.floatingEl, 
          smartDrop.type, 
          smartDrop.variantString, 
          smartDrop.width, false, true);

        draggingMove.originalType = smartDrop.type;
        draggingMove.originalVariantString = smartDrop.variantString;
      }
    }

    if (draggingMove.type == DRAGGING_TYPE_MOVE_TRANSFER) {
      document.querySelector('#trashcan').classList.add('visible');
    }
  }

  function _hideDebugInfo() {
    document.querySelector('#debug').classList.remove('visible');
  }

  function _onBodyMouseOut(event) {
    _infoBubble.hide();
  }

  function _onBodyMouseDown(event) {
    var el = event.target;

    _loseAnyFocus();
    _hideDebugInfo();

    var topEl = event.target;
    while (topEl && (topEl.id != 'info-bubble') && 
      ((!topEl.classList) ||
      ((!topEl.classList.contains('menu-attached')) && 
      (!topEl.classList.contains('menu'))))) {
      topEl = topEl.parentNode;
    }

    var withinMenu = !!topEl;

    if (withinMenu) {
      return;
    }

    _hideMenus();

    if (el.classList.contains('drag-handle')) {
      _handleSegmentResizeStart(event);
    } else {
      if (!el.classList.contains('segment') || 
          el.classList.contains('unmovable')) {
        return;
      }

      _handleSegmentMoveStart(event);
    }

    event.preventDefault();
  }

  function _makeSpaceBetweenSegments(x, y) {
    var left = x - streetSectionCanvasLeft;

    var selectedSegmentBefore = null;
    var selectedSegmentAfter = null;

    var farLeft = street.segments[0].el.savedNoMoveLeft;
    var farRight = 
        street.segments[street.segments.length - 1].el.savedNoMoveLeft + 
        street.segments[street.segments.length - 1].el.savedWidth;

    // TODO const
    if ((left < farLeft - 100) || (left > farRight + 100) || 
         (y < streetSectionTop - 100) || (y > streetSectionTop + 300)) {
      _updateWithinCanvas(false);
    } else {
      _updateWithinCanvas(true);
      for (var i in street.segments) {
        var segment = street.segments[i];

        if (!selectedSegmentBefore && ((segment.el.savedLeft + segment.el.savedWidth / 2) > left)) {
          selectedSegmentBefore = segment.el;
        }

        if ((segment.el.savedLeft + segment.el.savedWidth / 2) <= left) {
          selectedSegmentAfter = segment.el;
        }
      }
    }

    if ((selectedSegmentBefore != draggingMove.segmentBeforeEl) ||
        (selectedSegmentAfter != draggingMove.segmentAfterEl)) {
      draggingMove.segmentBeforeEl = selectedSegmentBefore;
      draggingMove.segmentAfterEl = selectedSegmentAfter;
      _repositionSegments();
      return true;
    } else {
      return false;
    }
  }

  function _onBodyMouseMove(event) {
    mouseX = event.pageX;
    mouseY = event.pageY;

    if (draggingType == DRAGGING_TYPE_NONE) {
      return;
    }

    switch (draggingType) {
      case DRAGGING_TYPE_MOVE:
        _handleSegmentMoveMove(event);
        break;
      case DRAGGING_TYPE_RESIZE:
        _handleSegmentResizeMove(event);
        break;
    }

    event.preventDefault();
  }

  /*function _removeTouchSegmentFadeouts() {
    var els = document.querySelectorAll('.fade-out-end');
    for (var i = 0, el; el = els[i]; i++) {
      el.classList.remove('fade-out-end');
    }
  }

  function _createTouchSegmentFadeout(el) {
    if (system.touch) {
      _removeTouchSegmentFadeouts();

      window.clearTimeout(el.fadeoutTimerId);
      el.classList.remove('fade-out-end');
      el.classList.add('fade-out-start');

      window.setTimeout(function() {
        el.classList.remove('fade-out-start');
        el.classList.add('fade-out-end');
      }, 0);

      el.fadeoutTimerId = window.setTimeout(function() {
        el.classList.remove('fade-out-end');
      }, TOUCH_SEGMENT_FADEOUT_DELAY);
    }
  }*/

  // DEBUG
  var TOUCH_CONTROLS_FADEOUT_DELAY = 1000;
  var TOUCH_CONTROLS_FADEOUT_TIME = 3000;

  var controlsFadeoutDelayTimer = -1;
  var controlsFadeoutHideTimer = -1;

  function _scheduleControlsFadeout(el) {
    _infoBubble.considerShowing(null, el, INFO_BUBBLE_TYPE_SEGMENT);

    _resumeFadeoutControls();
  }

  function _resumeFadeoutControls() {
    _cancelFadeoutControls();

    controlsFadeoutDelayTimer = window.setTimeout(_fadeoutControls, TOUCH_CONTROLS_FADEOUT_DELAY);
  }

  function _cancelFadeoutControls() {
    document.body.classList.remove('controls-fade-out');    
    window.clearTimeout(controlsFadeoutDelayTimer);
    window.clearTimeout(controlsFadeoutHideTimer);
  }

  function _fadeoutControls() {
    document.body.classList.add('controls-fade-out');

    controlsFadeoutHideTimer = window.setTimeout(_hideControls, TOUCH_CONTROLS_FADEOUT_TIME);
  }

  function _hideControls() {
    console.log('hide!');
    document.body.classList.remove('controls-fade-out');   
    if (_infoBubble.segmentEl) {
      _infoBubble.segmentEl.classList.remove('show-drag-handles');   
    }
    _infoBubble.hide();
    _infoBubble.hideSegment();
  }

  function _doDropHeuristics(type, variantString, width) {
    // Automatically figure out width

    if (draggingMove.type == DRAGGING_TYPE_MOVE_CREATE) {
      if ((street.remainingWidth > 0) && 
          (width > street.remainingWidth * TILE_SIZE)) {

        var segmentMinWidth = 
            SEGMENT_INFO[type].details[variantString].minWidth || 0;

        if ((street.remainingWidth >= MIN_SEGMENT_WIDTH) && 
            (street.remainingWidth >= segmentMinWidth)) {
          width = _normalizeSegmentWidth(street.remainingWidth, RESIZE_TYPE_INITIAL) * TILE_SIZE;
        }
      }
    }

    // Automatically figure out variants

    var leftEl = draggingMove.segmentAfterEl;
    var rightEl = draggingMove.segmentBeforeEl;

    var left = leftEl ? street.segments[leftEl.dataNo] : null;
    var right = rightEl ? street.segments[rightEl.dataNo] : null;

    var leftVariants = left && SEGMENT_INFO[left.type].variants;
    var rightVariants = right && SEGMENT_INFO[right.type].variants;

    var leftOwner = left && SEGMENT_INFO[left.type].owner;
    var rightOwner = right && SEGMENT_INFO[right.type].owner;

    var leftOwnerAsphalt = 
      (leftOwner == SEGMENT_OWNER_CAR) || (leftOwner == SEGMENT_OWNER_BIKE) || 
      (leftOwner == SEGMENT_OWNER_PUBLIC_TRANSIT);
    var rightOwnerAsphalt = 
      (rightOwner == SEGMENT_OWNER_CAR) || (rightOwner == SEGMENT_OWNER_BIKE) || 
      (rightOwner == SEGMENT_OWNER_PUBLIC_TRANSIT);

    var leftVariant = left && _getVariantArray(left.type, left.variantString);
    var rightVariant = right && _getVariantArray(right.type, right.variantString);

    var variant = _getVariantArray(type, variantString);

    // Direction

    if (SEGMENT_INFO[type].variants.indexOf('direction') != -1) {
      if (leftVariant && leftVariant['direction']) {
        variant['direction'] = leftVariant['direction'];
      } else if (rightVariant && rightVariant['direction']) {
        variant['direction'] = rightVariant['direction'];
      }
    }

    // Parking lane orientation

    if (SEGMENT_INFO[type].variants.indexOf('parking-lane-orientation') != -1) {
      if (!right || !rightOwnerAsphalt) {
        variant['parking-lane-orientation'] = 'right';
      } else if (!left || !leftOwnerAsphalt) {
        variant['parking-lane-orientation'] = 'left';
      }
    }

    // Parklet orientation

    if (type == 'parklet') {
      if (left && leftOwnerAsphalt) {
        variant['orientation'] = 'right';
      } else if (right && rightOwnerAsphalt) {
        variant['orientation'] = 'left';
      }
    }

    // Turn lane orientation

    if (SEGMENT_INFO[type].variants.indexOf('turn-lane-orientation') != -1) {
      if (!right || !rightOwnerAsphalt) {
        variant['turn-lane-orientation'] = 'right';
      } else if (!left || !leftOwnerAsphalt) {
        variant['turn-lane-orientation'] = 'left';
      }
    }

    // Transit shelter orientation and elevation

    if (type == 'transit-shelter') {
      if (left && (leftOwner == SEGMENT_OWNER_PUBLIC_TRANSIT)) {
        variant['orientation'] = 'right';
      } else if (right && (rightOwner == SEGMENT_OWNER_PUBLIC_TRANSIT)) {
        variant['orientation'] = 'left';
      }
    }

    if (SEGMENT_INFO[type].variants.indexOf('transit-shelter-elevation') != -1) {
      if (variant['orientation'] == 'right' && left && left.type == 'light-rail') {
        variant['transit-shelter-elevation'] = 'light-rail';
      } else if (variant['orientation'] == 'left' && right && right.type == 'light-rail') {
        variant['transit-shelter-elevation'] = 'light-rail';
      }
    }

    // Lamp orientation

    if (SEGMENT_INFO[type].variants.indexOf('lamp-orientation') != -1) {
      if (left && right && leftOwnerAsphalt && rightOwnerAsphalt) {
        variant['lamp-orientation'] = 'both';
      } else if (left && leftOwnerAsphalt) {
        variant['lamp-orientation'] = 'left';
      } else if (right && rightOwnerAsphalt) {
        variant['lamp-orientation'] = 'right';
      } else if (left && right) {
        variant['lamp-orientation'] = 'both';        
      } else if (left) {
        variant['lamp-orientation'] = 'left';        
      } else if (right) {
        variant['lamp-orientation'] = 'right';
      } else {
        variant['lamp-orientation'] = 'both';        
      }
    }

    variantString = _getVariantString(variant);

    return { type: type, variantString: variantString, width: width };
  }

  function _handleSegmentMoveCancel() {
    draggingMove.originalEl.classList.remove('dragged-out');

    draggingMove.segmentBeforeEl = null;
    draggingMove.segmentAfterEl = null;

    _repositionSegments();
    _updateWithinCanvas(true);
   
    _removeElFromDom(draggingMove.floatingEl);
    document.querySelector('#trashcan').classList.remove('visible');

    _changeDraggingType(DRAGGING_TYPE_NONE);
  }

  function _handleSegmentMoveEnd(event) {
    ignoreStreetChanges = false;

    var failedDrop = false;

    var segmentElControls = null;

    if (!draggingMove.withinCanvas) {
      if (draggingMove.type == DRAGGING_TYPE_MOVE_TRANSFER) {
        _removeElFromDom(draggingMove.originalEl);
      }
    } else if (draggingMove.segmentBeforeEl || draggingMove.segmentAfterEl || (street.segments.length == 0)) {
      var smartDrop = _doDropHeuristics(draggingMove.originalType, 
          draggingMove.originalVariantString, draggingMove.originalWidth);
      
      var newEl = _createSegment(smartDrop.type,
          smartDrop.variantString, smartDrop.width);

      newEl.classList.add('create');

      if (draggingMove.segmentBeforeEl) {
        document.querySelector('#street-section-editable').
            insertBefore(newEl, draggingMove.segmentBeforeEl);
      } else if (draggingMove.segmentAfterEl) {
        document.querySelector('#street-section-editable').
            insertBefore(newEl, draggingMove.segmentAfterEl.nextSibling);
      } else {
        // empty street
        document.querySelector('#street-section-editable').appendChild(newEl);
      }

      window.setTimeout(function() {
        newEl.classList.remove('create');
      }, SHORT_DELAY);

      if (draggingMove.type == DRAGGING_TYPE_MOVE_TRANSFER) {
        var draggedOutEl = document.querySelector('.segment.dragged-out');
        _removeElFromDom(draggedOutEl);
      }

      segmentElControls = newEl;
    } else {          
      failedDrop = true;

      draggingMove.originalEl.classList.remove('dragged-out');

      segmentElControls = draggingMove.originalEl;
    }

    draggingMove.segmentBeforeEl = null;
    draggingMove.segmentAfterEl = null;

    _repositionSegments();
    _segmentsChanged();
    _updateWithinCanvas(true);

    _removeElFromDom(draggingMove.floatingEl);
    document.querySelector('#trashcan').classList.remove('visible');

    _changeDraggingType(DRAGGING_TYPE_NONE);

    if (segmentElControls) {
      _scheduleControlsFadeout(segmentElControls);
    }

    if (failedDrop) {
      _infoBubble.show(true);    
    }
  }

  function _removeGuides(el) {
    var guideEl;
    while (guideEl = el.querySelector('.guide')) {
      _removeElFromDom(guideEl);
    }
  }

  function _handleSegmentResizeCancel() {
    _resizeSegment(draggingResize.segmentEl, RESIZE_TYPE_INITIAL,
        draggingResize.originalWidth * TILE_SIZE, true, false, true);

    _handleSegmentResizeEnd();
  }

  function _handleSegmentResizeEnd(event) {
    ignoreStreetChanges = false;

    _segmentsChanged();

    _changeDraggingType(DRAGGING_TYPE_NONE);

    var el = draggingResize.floatingEl;
    _removeElFromDom(el);
  
    draggingResize.segmentEl.classList.add('immediate-show-drag-handles'); 

    _removeGuides(draggingResize.segmentEl);
 
    _infoBubble.considerSegmentEl = draggingResize.segmentEl;
    _infoBubble.show(false);

    _scheduleControlsFadeout(draggingResize.segmentEl);

    _hideWidthChart();    

    suppressMouseEnter = true;
    _infoBubble.considerShowing(event, draggingResize.segmentEl, INFO_BUBBLE_TYPE_SEGMENT);
    window.setTimeout(function() {
      suppressMouseEnter = false;
    }, 50);
  }

  function _onBodyMouseUp(event) {
    switch (draggingType) {
      case DRAGGING_TYPE_NONE:
        return;
      case DRAGGING_TYPE_MOVE:
        _handleSegmentMoveEnd(event);
        break;
      case DRAGGING_TYPE_RESIZE:
        _handleSegmentResizeEnd(event);
        break;
    }

    event.preventDefault();
  }

  function _createPalette() {
    //var deg = 0;

    for (var id in SEGMENT_INFO) {
      var segmentInfo = SEGMENT_INFO[id];

      // TODO hack to get the first variant name
      for (var j in segmentInfo.details) {
        var variantName = j;
        break;
      }
      // TODO hardcoded
      if (id == 'sidewalk-lamp') {
        variantName = 'both|traditional';
      }

      var variantInfo = segmentInfo.details[variantName];

      var dimensions = _getVariantInfoDimensions(variantInfo, 0, 1);

      var width = dimensions.right - dimensions.left;
      if (!width) {
        width = segmentInfo.defaultWidth;
      }
      width += PALETTE_EXTRA_SEGMENT_PADDING;

      var el = _createSegment(id, 
        variantName,
        width * TILE_SIZE / WIDTH_PALETTE_MULTIPLIER, 
        false, 
        true);

      el.classList.add('palette');

      document.querySelector('.palette-canvas').appendChild(el);
    }

    document.querySelector('.palette-canvas').style.width = 
        document.querySelector('.palette-canvas').scrollWidth + 'px';
  }

  function _resizeStreetWidth(dontScroll) {
    var width = street.width * TILE_SIZE;

    document.querySelector('#street-section-canvas').style.width = width + 'px';
    if (!dontScroll) {
      document.querySelector('#street-section-outer').scrollLeft = (width + BUILDING_SPACE * 2 - system.viewportWidth) / 2;
      _onStreetSectionScroll();
    }

    _onResize();
  }

  function _resizeStreetName() {
    var streetNameCanvasWidth = 
        document.querySelector('#street-name-canvas').offsetWidth;
    var streetNameWidth = 
        document.querySelector('#street-name > div').scrollWidth;

    if (streetNameWidth > streetNameCanvasWidth) {
      document.querySelector('#street-name').style.width = streetNameCanvasWidth + 'px';
    } else {
      document.querySelector('#street-name').style.width = 'auto';
    }
  }

  function _updateScrollButtons() {
    var els = document.querySelectorAll('[scroll-buttons]');
    for (var i = 0, el; el = els[i]; i++) {
      _repositionScrollButtons(el);
      _scrollButtonScroll(el);
    }
  }

  function _updateGalleryShield() {
    document.querySelector('#gallery-shield').style.width = 0;//document.querySelector('#street-section-outer').scrollWidth + 'px';
    window.setTimeout(function() {
      document.querySelector('#gallery-shield').style.height = system.viewportHeight + 'px';
      document.querySelector('#gallery-shield').style.width = document.querySelector('#street-section-outer').scrollWidth + 'px';
    }, 0);
  }

  function _onResize() {
    system.viewportWidth = window.innerWidth;
    system.viewportHeight = window.innerHeight;

    //console.log(window.scrollTop, document.body.scrollTop);

    var streetSectionHeight = 
        document.querySelector('#street-section-inner').offsetHeight;

    var paletteTop = document.querySelector('footer').offsetTop || system.viewportHeight;
    //console.log(paletteTop);

    // TODO const
    streetSectionTop = (system.viewportHeight - streetSectionHeight) / 2 + 30 + 180; // gallery height

    // TODO const
    if (streetSectionTop + document.querySelector('#street-section-inner').offsetHeight > 
      paletteTop - 20 + 180) { // gallery height
      streetSectionTop = paletteTop - 20 - streetSectionHeight + 180;
    }

    _updateGalleryShield();

    document.querySelector('#street-section-inner').style.top = streetSectionTop + 'px';

    document.querySelector('#street-section-sky').style.top = (streetSectionTop * .8) + 'px';

    var streetSectionDirtPos = system.viewportHeight - streetSectionTop - 400 + 180;

    document.querySelector('#street-section-dirt').style.height = 
        streetSectionDirtPos + 'px';

    var skyTop = streetSectionTop;
    if (skyTop < 0) {
      skyTop = 0;
    }
    document.querySelector('#street-section-sky').style.paddingTop = skyTop + 'px';
    document.querySelector('#street-section-sky').style.marginTop = -skyTop + 'px';

    streetSectionCanvasLeft = 
        ((system.viewportWidth - street.width * TILE_SIZE) / 2) - BUILDING_SPACE;
    if (streetSectionCanvasLeft < 0) {
      streetSectionCanvasLeft = 0;
    }
    document.querySelector('#street-section-canvas').style.left = 
      streetSectionCanvasLeft + 'px';

    document.querySelector('#street-section-editable').style.width = 
      (street.width * TILE_SIZE) + 'px';

    _resizeStreetName();

    _infoBubble.show(true);
    _updateScrollButtons();

    _updateBuildingPosition();
    // TODO hack
    _createBuildings();

    _updateStreetNameCanvasPos();
  }

  function _updateStreetNameCanvasPos() {
    var menuEl = document.querySelector('#top-menu-bar ul.right');
    var menuElPos = _getElAbsolutePos(menuEl);

    var streetNameEl = document.querySelector('#street-name');
    var streetNameElPos = _getElAbsolutePos(streetNameEl);

    document.querySelector('#street-name-canvas').classList.add('no-movement');
    if (streetNameElPos[0] + streetNameEl.offsetWidth > menuElPos[0]) {
      document.querySelector('#street-name-canvas').classList.add('move-down-for-menu');
    } else {
      document.querySelector('#street-name-canvas').classList.remove('move-down-for-menu');
    }

    window.setTimeout(function() {
      document.querySelector('#street-name-canvas').classList.remove('no-movement');
    }, 50);
  }

  function _updateBuildingPosition() {
    var el = document.querySelector('#street-section-editable');
    var pos = _getElAbsolutePos(el);

    var width = pos[0] + 50 + 25;

    if (width < 0) {
      width = 0;
    }

    document.querySelector('#street-section-left-building').style.width = width + 'px';
    document.querySelector('#street-section-right-building').style.width = width + 'px';

    document.querySelector('#street-section-left-building').style.left = (-width + 25) + 'px';
    document.querySelector('#street-section-right-building').style.right = (-width + 25) + 'px';

    document.querySelector('#street-section-dirt').style.marginLeft = -width + 'px';
    document.querySelector('#street-section-dirt').style.marginRight = -width + 'px';
  }

  function _fillDefaultSegments() {
    street.segments = [];

    for (var i in DEFAULT_SEGMENTS[leftHandTraffic]) {
      var segment = DEFAULT_SEGMENTS[leftHandTraffic][i];
      segment.warnings = [];
      segment.variantString = _getVariantString(segment.variant);

      street.segments.push(segment);
    }

    _normalizeAllSegmentWidths();
  }

  function _createStreetWidthOption(width) {
    var el = document.createElement('option');
    el.value = width;
    el.innerHTML = _prettifyWidth(width, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);
    return el;
  }

  function _buildStreetWidthMenu() {
    document.querySelector('#street-width').innerHTML = '';

    var el = document.createElement('option');
    el.disabled = true;
    el.innerHTML = 'Building-to-building width:';
    document.querySelector('#street-width').appendChild(el);  

    var widths = [];    

    for (var i in DEFAULT_STREET_WIDTHS) {
      var width = _normalizeStreetWidth(DEFAULT_STREET_WIDTHS[i]);
      var el = _createStreetWidthOption(width);
      document.querySelector('#street-width').appendChild(el);

      widths.push(width);
    }

    if (widths.indexOf(parseFloat(street.width)) == -1) {
      var el = document.createElement('option');
      el.disabled = true;
      document.querySelector('#street-width').appendChild(el);      

      var el = _createStreetWidthOption(street.width);
      document.querySelector('#street-width').appendChild(el);      
    }

    var el = document.createElement('option');
    el.value = STREET_WIDTH_CUSTOM;
    el.innerHTML = 'Different width…';
    document.querySelector('#street-width').appendChild(el);  

    var el = document.createElement('option');
    el.disabled = true;
    document.querySelector('#street-width').appendChild(el);  

    var el = document.createElement('option');
    el.value = STREET_WIDTH_SWITCH_TO_IMPERIAL;
    el.id = 'switch-to-imperial-units';
    el.innerHTML = msg('MENU_SWITCH_TO_IMPERIAL');
    if (street.units == SETTINGS_UNITS_IMPERIAL) {
      el.disabled = true;
    }
    document.querySelector('#street-width').appendChild(el);  

    var el = document.createElement('option');
    el.value = STREET_WIDTH_SWITCH_TO_METRIC;
    el.id = 'switch-to-metric-units';
    el.innerHTML = msg('MENU_SWITCH_TO_METRIC');
    if (street.units == SETTINGS_UNITS_METRIC) {
      el.disabled = true;
    }

    document.querySelector('#street-width').appendChild(el);  

    document.querySelector('#street-width').value = street.width;   
  }

  function _onStreetWidthClick(event) {
    document.body.classList.add('edit-street-width');

    document.querySelector('#street-width').focus();

    window.setTimeout(function() {
      var trigger = document.createEvent('MouseEvents');
      trigger.initEvent('mousedown', true, true, window);
      document.querySelector('#street-width').dispatchEvent(trigger);
    }, 0);
  }

  function _onStreetWidthChange(event) {
    var el = event.target;
    var newStreetWidth = el.value;

    document.body.classList.remove('edit-street-width');

    if (newStreetWidth == street.width) {
      return;
    } else if (newStreetWidth == STREET_WIDTH_SWITCH_TO_METRIC) {
      _updateUnits(SETTINGS_UNITS_METRIC);
      return;
    } else if (newStreetWidth == STREET_WIDTH_SWITCH_TO_IMPERIAL) {
      _updateUnits(SETTINGS_UNITS_IMPERIAL);
      return;
    } else if (newStreetWidth == STREET_WIDTH_CUSTOM) {
      _ignoreWindowFocusMomentarily();
      // TODO string
      var width = prompt(
          msg('PROMPT_NEW_STREET_WIDTH', 
          { minWidth: _prettifyWidth(MIN_CUSTOM_STREET_WIDTH, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP), 
            maxWidth: _prettifyWidth(MAX_CUSTOM_STREET_WIDTH, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP) }));

      if (width) {
        width = _normalizeStreetWidth(_processWidthInput(width));
      }

      if (!width) {
        _buildStreetWidthMenu();

        _loseAnyFocus();
        return;
      }

      if (width < MIN_CUSTOM_STREET_WIDTH) {
        width = MIN_CUSTOM_STREET_WIDTH;
      } else if (width > MAX_CUSTOM_STREET_WIDTH) {
        width = MAX_CUSTOM_STREET_WIDTH;
      }
      newStreetWidth = width;
    }

    street.width = _normalizeStreetWidth(newStreetWidth);
    _buildStreetWidthMenu();
    _resizeStreetWidth();

    initializing = true;

    _createDomFromData();
    _segmentsChanged();

    initializing = false; 

    _loseAnyFocus();   
  }

  function _removeSegment(el, all) {
    if (all) {
      street.segments = [];
      _createDomFromData();
      _segmentsChanged();

      _infoBubble.hide();

      _statusMessage.show(msg('STATUS_ALL_SEGMENTS_DELETED'), true);
    } else if (el && el.parentNode) {
      _removeElFromDom(el);
      _segmentsChanged();

      _infoBubble.hide();

      _statusMessage.show(msg('STATUS_SEGMENT_DELETED'), true);
    }

    if (street.segments.length) {
      _showWidthChartImmediately();
      _hideWidthChart();
    }
  } 

  function _getHoveredSegmentEl() {
    var el = document.querySelector('.segment.hover');
    return el;
/*
    var el = document.elementFromPoint(mouseX, mouseY);
    while (el && el.classList && !el.classList.contains('segment')) {
      el = el.parentNode;
    }

    if (el.classList && el.classList.contains('segment')) {
      return el;
    } else {
      return null;
    }*/
  }

  function _showDebugInfo() {
    var debugStreetData = _clone(street);
    var debugUndo = _clone(undoStack);
    var debugSettings = _clone(settings);

    for (var i in debugStreetData.segments) {
      delete debugStreetData.segments[i].el;
    }

    for (var j in debugUndo) {
      for (var i in debugUndo[j].segments) {
        delete debugUndo[j].segments[i].el;
      }
    }

    var debugText = 
        'DATA:\n' + JSON.stringify(debugStreetData, null, 2) +
        '\n\nSETTINGS:\n' + JSON.stringify(debugSettings, null, 2) +
        '\n\nUNDO:\n' + JSON.stringify(debugUndo, null, 2);

    document.querySelector('#debug').classList.add('visible');
    document.querySelector('#debug > textarea').innerHTML = debugText;
    document.querySelector('#debug > textarea').focus();
    document.querySelector('#debug > textarea').select();
    event.preventDefault();
  }

  function _onBodyKeyDown(event) {
    switch (event.keyCode) {
      case KEY_EQUAL:
      case KEY_EQUAL_ALT:
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }

        //console.log(document.activeElement);

        if (document.activeElement == document.body) {
          var segmentHoveredEl = _getHoveredSegmentEl();
          if (segmentHoveredEl) {
            _incrementSegmentWidth(segmentHoveredEl, true, event.shiftKey);
          }
          event.preventDefault();
        }
        break;
      case KEY_MINUS:
      case KEY_MINUS_ALT:
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }

        if (document.activeElement == document.body) {
          var segmentHoveredEl = _getHoveredSegmentEl();
          if (segmentHoveredEl) {
            _incrementSegmentWidth(segmentHoveredEl, false, event.shiftKey);
          }
          event.preventDefault();
        }
        break;
      case KEY_BACKSPACE:
      case KEY_DELETE:
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }

        if (document.activeElement == document.body) {
          var segmentHoveredEl = _getHoveredSegmentEl();
          _removeSegment(segmentHoveredEl, event.shiftKey);
          event.preventDefault();
        }
        break;
      case KEY_LEFT_ARROW:
        var el = document.querySelector('#street-section-outer');
        $(el).stop(true, true);

        if (event.shiftKey) {
          var newScrollLeft = 0;
        } else {
          var newScrollLeft = el.scrollLeft - (el.offsetWidth * .5);
        }

        // TODO const
        $(el).animate({ scrollLeft: newScrollLeft }, 300);
        event.preventDefault();
        break;
      case KEY_RIGHT_ARROW:
        var el = document.querySelector('#street-section-outer');
        $(el).stop(true, true);

        if (event.shiftKey) {
          var newScrollLeft = el.scrollWidth - el.offsetWidth;
        } else {
          var newScrollLeft = el.scrollLeft + (el.offsetWidth * .5);
        }

        // TODO const
        $(el).animate({ scrollLeft: newScrollLeft }, 300);
        event.preventDefault();
        break;
      case KEY_ESC:
        _hideDebugInfo();
        whatIsThis.hideInfo();

        if (draggingType == DRAGGING_TYPE_RESIZE) {
          _handleSegmentResizeCancel();
        } else if (draggingType == DRAGGING_TYPE_MOVE) {
          _handleSegmentMoveCancel();
        } else if (menuVisible) {
          _hideMenus();
        } else if (_infoBubble.visible && _infoBubble.descriptionVisible) {
          _infoBubble.hideDescription();
        } else if (_infoBubble.visible) {
          _infoBubble.hide();
          _infoBubble.hideSegment(false);
        } else if (document.body.classList.contains('gallery-visible')) {
          _hideGallery(false);
        } else if (signedIn) {
          _showGallery(signInData.userId, false);
        }

        event.preventDefault();
        break;
      case KEY_Z:
        if (!event.shiftKey && (event.metaKey || event.ctrlKey)) {
          _undo();
          event.preventDefault();
        } else if (event.shiftKey && (event.metaKey || event.ctrlKey)) {
          _redo();
          event.preventDefault();
        }
        break;
      case KEY_S:
        if (event.metaKey || event.ctrlKey) {
          _statusMessage.show(msg('STATUS_NO_NEED_TO_SAVE'));
          event.preventDefault();
        }
        break;
      case KEY_Y:
        if (event.metaKey || event.ctrlKey) {
          _redo();
          event.preventDefault();
        }   
        break;   
      case KEY_D:
        if (event.shiftKey && (document.activeElement == document.body)) {
          _showDebugInfo();
          event.preventDefault();
        }
        break;
      }
  }

  function _onRemoveButtonClick(event) {
    var el = event.target.segmentEl;

    if (el) {
      _removeSegment(el, event.shiftKey);
    }

    // Prevent this “leaking” to a segment below
    event.preventDefault();
  }

  function _normalizeSlug(slug) {
    slug = slug.toLowerCase();
    slug = slug.replace(/ /g, '-');
    slug = slug.replace(/-{2,}/, '-');
    slug = slug.replace(/^[-]+|[-]+$/g, '');
    slug = slug.replace(/[^a-zA-Z0-9\-]/g, '');

    return slug;
  }

  function _getStreetUrl(street) {
    var url = '/';

    if (street.creatorId) {
      if (RESERVED_URLS.indexOf(street.creatorId) != -1) {
        url += URL_RESERVED_PREFIX;
      }

      url += street.creatorId;
    } else {
      url += URL_NO_USER;
    }

    url += '/';

    url += street.namespacedId;

    if (street.creatorId) {
      //console.log('name', street.name);
      var slug = _normalizeSlug(street.name);
      url += '/' + encodeURIComponent(slug);
    }

    return url;
  }

  function _updatePageUrl(forceGalleryUrl) {
    if (forceGalleryUrl) {
      var url = '/' + galleryUserId;
    } else {
      var url = _getStreetUrl(street);
    }

    if (debug.hoverPolygon) {
      // TODO const
      url += '&debug-hover-polygon';
    }
    if (debug.forceLeftHandTraffic) {
      url += '&debug-force-left-hand-traffic';
    }
    if (debug.forceMetric) {
      url += '&debug-force-metric';
    }
    if (debug.forceUnsupportedBrowser) {
      url += '&debug-force-unsupported-browser';
    }

    url = url.replace(/\&/, '?');

    window.history.replaceState(null, null, url);

    _updateShareMenu();
  }

  function _updatePageTitle() {
    // TODO const/interpolate
    var title = street.name;

    if (street.creatorId && (!signedIn || (signInData.userId != street.creatorId))) {
      title += ' (by ' + street.creatorId + ')';
    }

    title += ' – Streetmix';

    document.title = title;
  }

  function _onAnotherUserIdClick(event) {
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      return;
    }

    var el = event.target;

    var userId = el.innerHTML;

    _showGallery(userId, false);

    event.preventDefault();
  }

  function _updateStreetNameFont(el) {
    var name = el.querySelector('div').innerHTML;

    var usingSupportedGlyphs = true;
    for (var i in name) {
      if (STREET_NAME_FONT_GLYPHS.indexOf(name.charAt(i)) == -1) {
        usingSupportedGlyphs = false;
        break;
      }
    }

    if (usingSupportedGlyphs) {
      el.classList.remove('fallback-unicode-font');
    } else {
      el.classList.add('fallback-unicode-font');
    }
  }

  function _updateStreetMetadata() {
    var html = _prettifyWidth(street.width, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP) + ' street';
    document.querySelector('#street-width-read').innerHTML = html;

    if (street.creatorId && (!signedIn || (street.creatorId != signInData.userId))) {
      // TODO const
      var html = "by <div class='avatar' userId='" + street.creatorId + "'></div>" +
          "<a class='user-gallery' href='/" +  
          street.creatorId + "'>" + street.creatorId + "</a>";
          
      document.querySelector('#street-metadata-author').innerHTML = html;

      _fetchAvatars();

      document.querySelector('#street-metadata-author .user-gallery').addEventListener('click', _onAnotherUserIdClick);
    } else if (!street.creatorId && (signedIn || remixOnFirstEdit)) {
      var html = 'by ' + msg('USER_ANONYMOUS');

      document.querySelector('#street-metadata-author').innerHTML = html;
    } else {
      document.querySelector('#street-metadata-author').innerHTML = ''; 
    }

    var html = _formatDate(moment(street.updatedAt));
    document.querySelector('#street-metadata-date').innerHTML = html;
  }

  function _updateStreetName() {
    $('#street-name > div').text(street.name);

    _updateStreetNameFont(document.querySelector('#street-name'));

    _resizeStreetName();

    _updateStreetMetadata();
    _updateStreetNameCanvasPos();

    _unifyUndoStack();
    _updatePageUrl();
    _updatePageTitle();
  }

  function _normalizeStreetName(name) {
    name = jQuery.trim(name);

    if (name.length > MAX_STREET_NAME_WIDTH) {
      name = name.substr(0, MAX_STREET_NAME_WIDTH) + '…';
    }

    return name;
  }

  function _askForStreetName() {
    _ignoreWindowFocusMomentarily();

    var newName = prompt(msg('PROMPT_NEW_STREET_NAME'), street.name);

    if (newName) {
      street.name = _normalizeStreetName(newName);

      _updateStreetName();
      _saveStreetToServerIfNecessary();
      _updateStreetNameCanvasPos();
    }
  }

  function _fetchStreetForVerification() {
    // Don’t do it with any network services pending
    if (_getNonblockingAjaxRequestCount() || blockingAjaxRequestInProgress || 
        saveStreetIncomplete || abortEverything || remixOnFirstEdit) {
      return;
    }

    var url = _getFetchStreetUrl();

    jQuery.ajax({
      url: url,
      dataType: 'json',
      type: 'GET',
    }).done(_receiveStreetForVerification).fail(_errorReceiveStreetForVerification);
  }

  function _receiveStreetForVerification(transmission) {
    var localStreetData = _trimStreetData(street);
    var serverStreetData = _trimStreetData(_unpackStreetDataFromServerTransmission(transmission));

    if (JSON.stringify(localStreetData) != JSON.stringify(serverStreetData)) {
      console.log('NOT EQUAL');
      console.log('-');
      console.log(JSON.stringify(localStreetData));
      console.log('-');
      console.log(JSON.stringify(serverStreetData));
      console.log('-');
      console.log(transmission);

      _statusMessage.show(msg('STATUS_RELOADED_FROM_SERVER'));

      _unpackServerStreetData(transmission, null, null, false);
      _updateEverything(true);
    }
  }

  function _errorReceiveStreetForVerification(data) {
    // 404 should never happen here, since 410 designates streets that have
    // been deleted (but remain hidden on the server)

    if (signedIn && ((data.status == 404) || (data.status == 410))) {
      // Means street was deleted

      _showError(ERROR_STREET_DELETED_ELSEWHERE, true);
    }
  }

  // Because Firefox is stupid and their prompt() dialog boxes are not quite 
  // modal.
  function _ignoreWindowFocusMomentarily() {
    ignoreWindowFocus = true;
    window.setTimeout(function() {
      ignoreWindowFocus = false;
    }, 50);
  }

  function _onWindowFocus() {
    if (abortEverything || ignoreWindowFocus) {
      return;
    }

    if (!galleryVisible) {
      _fetchStreetForVerification();

      // Save settings on window focus, so the last edited street is the one you’re
      // currently looking at (in case you’re looking at many streets in various
      // tabs)
      _saveSettingsLocally();
    }
  }

  function _onWindowBlur() {
    if (abortEverything) {
      return;
    }

    _hideMenus();
  }

  function _onStorageChange() {
    if (signedIn && !window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]) {
      mode = MODE_FORCE_RELOAD_SIGN_OUT;
      _processMode();
    } else if (!signedIn && window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]) {
      //console.log('blah', window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]);
      mode = MODE_FORCE_RELOAD_SIGN_IN;
      _processMode();      
    }
  }

  function _makeDefaultStreet() {
    ignoreStreetChanges = true;
    _prepareDefaultStreet();
    _setUpdateTimeToNow();

    _resizeStreetWidth();
    _updateStreetName();
    _createDomFromData();
    _segmentsChanged();
    _updateShareMenu();

    ignoreStreetChanges = false;
    lastStreet = _trimStreetData(street);

    _saveStreetToServer(false);
  }

  function _onNewStreetDefaultClick() {
    settings.newStreetPreference = NEW_STREET_DEFAULT;
    _saveSettingsLocally();

    _makeDefaultStreet();
  }

  function _onNewStreetEmptyClick() {
    settings.newStreetPreference = NEW_STREET_EMPTY;
    _saveSettingsLocally();

    ignoreStreetChanges = true;
    _prepareEmptyStreet();

    _resizeStreetWidth();
    _updateStreetName();
    _createDomFromData();
    _segmentsChanged();
    _updateShareMenu();

    ignoreStreetChanges = false;
    lastStreet = _trimStreetData(street);

    _saveStreetToServer(false);
  }

  function _onNewStreetLastClick() {
    _fetchLastStreet();
  }

  function _fetchLastStreet() {
    _newBlockingAjaxRequest(msg('BLOCKING_LOADING'), 
        {
          // TODO const
          url: API_URL + 'v1/streets/' + settings.priorLastStreetId,
          dataType: 'json',
          type: 'GET',
          headers: { 'Authorization': _getAuthHeader() }
        }, _receiveLastStreet, _cancelReceiveLastStreet
    );
  }

  function _cancelReceiveLastStreet() {
    document.querySelector('#new-street-default').checked = true;
    _makeDefaultStreet();
  }

  function _receiveLastStreet(transmission) {
    //console.log('received last street', transmission);

    ignoreStreetChanges = true;

    _unpackServerStreetData(transmission, street.id, street.namespacedId, false);
    street.originalStreetId = settings.priorLastStreetId;
    _addRemixSuffixToName();

    if (signedIn) {
      _setStreetCreatorId(signInData.userId);
    } else {
      _setStreetCreatorId(null);
    }
    _setUpdateTimeToNow();

    _propagateUnits();

    // TODO this is stupid, only here to fill some structures
    _createDomFromData();
    _createDataFromDom();

    _unifyUndoStack();

    _resizeStreetWidth();
    _updateStreetName();
    _createDomFromData();
    _segmentsChanged();
    _updateShareMenu();

    ignoreStreetChanges = false;
    lastStreet = _trimStreetData(street);

    _saveStreetToServer(false);
  }

  function _showNewStreetMenu() {
    switch (settings.newStreetPreference) {
      case NEW_STREET_EMPTY:
        document.querySelector('#new-street-empty').checked = true;
        break;
      case NEW_STREET_DEFAULT:
        document.querySelector('#new-street-default').checked = true;
        break;
    }

    if (settings.priorLastStreetId && settings.priorLastStreetId != street.id) {
      document.querySelector('#new-street-last').parentNode.classList.add('visible');
    }

    document.querySelector('#new-street-menu').classList.add('visible');
  }

  function _hideNewStreetMenu() {
    document.querySelector('#new-street-menu').classList.remove('visible');
  }

  function _fetchGalleryData() {
    if (galleryUserId) {
      jQuery.ajax({
        // TODO const
        url: API_URL + 'v1/users/' + galleryUserId + '/streets',
        dataType: 'json',
        type: 'GET',
        headers: { 'Authorization': _getAuthHeader() }
      }).done(_receiveGalleryData).fail(_errorReceiveGalleryData);
    } else {
      jQuery.ajax({
        // TODO const
        url: API_URL + 'v1/streets',
        dataType: 'json',
        type: 'GET',
      }).done(_receiveGalleryData).fail(_errorReceiveGalleryData);      
    }
  }

  function _errorReceiveGalleryData(data) {
    if ((mode == MODE_USER_GALLERY) && (data.status == 404)) {
      mode = MODE_404;
      _processMode();
      _hideGallery(true);
    } else {
      document.querySelector('#gallery .loading').classList.remove('visible');
      document.querySelector('#gallery .error-loading').classList.add('visible');    
    }
  }

  function _repeatReceiveGalleryData() {
    _loadGalleryContents();
  }

  function _fetchGalleryStreet(streetId) {
    //console.log('fetching', streetId);

    _showBlockingShield();

    jQuery.ajax({
      // TODO const
      url: API_URL + 'v1/streets/' + streetId,
      dataType: 'json',
      type: 'GET',
      headers: { 'Authorization': _getAuthHeader() }
    }).done(_receiveGalleryStreet)
    .fail(_errorReceiveGalleryStreet);
  }

  function _errorReceiveGalleryStreet() {
    _hideBlockingShield();
    galleryStreetLoaded = true;
    galleryStreetId = street.id; 

    _updateGallerySelection();
  }

  function _receiveStreet(transmission) {
    _unpackServerStreetData(transmission, null, null, true);

    _propagateUnits();

    // TODO this is stupid, only here to fill some structures
    _createDomFromData();
    _createDataFromDom();

    serverContacted = true;
    _checkIfEverythingIsLoaded();
  }  

  // TODO similar to receiveLastStreet
  function _receiveGalleryStreet(transmission) {
    if (transmission.id != galleryStreetId) {
      return;
    }

    galleryStreetLoaded = true;

    _hideBlockingShield();

    ignoreStreetChanges = true;

    _hideError();

    _unpackServerStreetData(transmission, null, null, true);

    _propagateUnits();

    // TODO this is stupid, only here to fill some structures
    _createDomFromData();
    _createDataFromDom();

    _hideNewStreetMenu();
    _resizeStreetWidth();
    _updateStreetName();
    _createDomFromData();
    _segmentsChanged();
    _updateShareMenu();

    ignoreStreetChanges = false;
    lastStreet = _trimStreetData(street);
  }

  function _updateGallerySelection() {
    var els = document.querySelectorAll('#gallery .streets .selected');
    for (var i = 0, el; el = els[i]; i++) {
      el.classList.remove('selected');
    }

    var el = document.querySelector('#gallery .streets [streetId="' + 
        galleryStreetId + '"]');
    if (el) {
      el.classList.add('selected');
    }
  }

  function _switchGalleryStreet(id) {
    galleryStreetId = id;

    _updateGallerySelection();
    _fetchGalleryStreet(galleryStreetId);    
  }

  function _onGalleryStreetClick(event) {
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      return;
    }

    var el = this;
    _switchGalleryStreet(el.getAttribute('streetId'));

    event.preventDefault();
  }

  function _formatDate(date) {
    // TODO hack
    var today = moment(new Date().getTime());
    // TODO const
    var todayFormat = today.format('MMM D, YYYY');
    var dateFormat = date.format('MMM D, YYYY');

    if (dateFormat != todayFormat) {
      return dateFormat;
    } else {
      return '';
    }
  }

  function _clearBlockingShieldTimers() {
    window.clearTimeout(blockingShieldTimerId);
    window.clearTimeout(blockingShieldTooSlowTimerId);
  }

  function _showBlockingShield(message) {
    if (!message) {
      message = 'Loading…';
    }

    _hideBlockingShield();
    _clearBlockingShieldTimers();

    document.querySelector('#blocking-shield .message').innerHTML = message;
    document.querySelector('#blocking-shield').classList.add('visible');

    blockingShieldTimerId = window.setTimeout(function() {
      document.querySelector('#blocking-shield').classList.add('darken');
    }, BLOCKING_SHIELD_DARKEN_DELAY);

    blockingShieldTooSlowTimerId = window.setTimeout(function() {
      document.querySelector('#blocking-shield').classList.add('show-too-slow');
    }, BLOCKING_SHIELD_TOO_SLOW_DELAY);
  }

  function _darkenBlockingShield(message) {
    _clearBlockingShieldTimers();
    document.querySelector('#blocking-shield').classList.add('darken-immediately');
  }

  function _hideBlockingShield() {
    _clearBlockingShieldTimers();
    document.querySelector('#blocking-shield').classList.remove('visible');
    document.querySelector('#blocking-shield').classList.remove('darken');
    document.querySelector('#blocking-shield').classList.remove('darken-immediately');
    document.querySelector('#blocking-shield').classList.remove('show-try-again');
    document.querySelector('#blocking-shield').classList.remove('show-too-slow');
    document.querySelector('#blocking-shield').classList.remove('show-cancel');
  }

  function _onDeleteGalleryStreet(event) {
    var el = event.target.parentNode;
    var name = el.streetName;

    _ignoreWindowFocusMomentarily();
    // TODO escape name
    if (confirm(msg('PROMPT_DELETE_STREET', { name: name }))) {
      if (el.getAttribute('streetId') == street.id) {
        _showError(ERROR_NO_STREET, false);
      }

      _sendDeleteStreetToServer(el.getAttribute('streetId'));

      _removeElFromDom(el.parentNode);
      _updateGalleryStreetCount();
    }

    event.preventDefault();
    event.stopPropagation();
  }

  function _sendDeleteStreetToServer(id) {
    // Prevents new street submenu from showing the last street
    if (settings.lastStreetId == id) {
      settings.lastStreetId = null;
      settings.lastStreetCreatorId = null;
      settings.lastStreetNamespacedId = null;
      
      _saveSettingsLocally();
      _saveSettingsToServer();
    }

    _newNonblockingAjaxRequest({
      // TODO const
      url: API_URL + 'v1/streets/' + id,
      dataType: 'json',
      type: 'DELETE',
      headers: { 'Authorization': _getAuthHeader() }
    }, false);
  }

  function _updateGalleryStreetCount() {
    if (galleryUserId) {
      var streetCount = document.querySelectorAll('#gallery .streets li').length;

      switch (streetCount) {
        case 0: 
          var text = 'No streets yet';
          break;
        case 1:
          var text = '1 street';
          break;
        default:
          var text = streetCount += ' streets';
          break;
      }
    } else {
      var text = '';
    }
    document.querySelector('#gallery .street-count').innerHTML = text;
  }

  function _receiveGalleryData(transmission) {
    //console.log('receive gallery data', transmission);

    document.querySelector('#gallery .loading').classList.remove('visible');

    for (var i in transmission.streets) {
      var galleryStreet = transmission.streets[i];
      _updateToLatestSchemaVersion(galleryStreet.data.street);

      var el = document.createElement('li');

      var anchorEl = document.createElement('a');

      galleryStreet.creatorId = 
          (galleryStreet.creator && galleryStreet.creator.id);

      galleryStreet.name = galleryStreet.name || DEFAULT_NAME;

      anchorEl.href = _getStreetUrl(galleryStreet);
      
      anchorEl.streetName = galleryStreet.name;
      anchorEl.setAttribute('streetId', galleryStreet.id);

      if (galleryStreetId == galleryStreet.id) {
        anchorEl.classList.add('selected');
      }

      $(anchorEl).click(_onGalleryStreetClick);

      var thumbnailEl = document.createElement('canvas');
      thumbnailEl.width = THUMBNAIL_WIDTH * system.hiDpi * 2;
      thumbnailEl.height = THUMBNAIL_HEIGHT * system.hiDpi * 2;
      var ctx = thumbnailEl.getContext('2d');
      _drawStreetThumbnail(ctx, galleryStreet.data.street, 
          THUMBNAIL_WIDTH * 2, THUMBNAIL_HEIGHT * 2, THUMBNAIL_MULTIPLIER, true);
      anchorEl.appendChild(thumbnailEl);

      var nameEl = document.createElement('div');
      nameEl.classList.add('street-name');
      nameEl.innerHTML = '<div></div>';
      anchorEl.appendChild(nameEl);

      $(nameEl.querySelector('div')).text(galleryStreet.name);
      _updateStreetNameFont(nameEl);

      var date = moment(galleryStreet.updatedAt);
      var dateEl = document.createElement('span');
      dateEl.classList.add('date');
      dateEl.innerHTML = _formatDate(date);
      anchorEl.appendChild(dateEl);

      if (!galleryUserId) {
        var creatorEl = document.createElement('span');
        creatorEl.classList.add('creator');

        var creatorName = galleryStreet.creatorId || msg('USER_ANONYMOUS');

        creatorEl.innerHTML = creatorName;
        anchorEl.appendChild(creatorEl);
      }

      // Only show delete links if you own the street
      if (signedIn && (galleryStreet.creatorId == signInData.userId)) {
        var removeEl = document.createElement('button');
        removeEl.classList.add('remove');
        removeEl.addEventListener('click', _onDeleteGalleryStreet);
        removeEl.innerHTML = '×';
        removeEl.title = msg('TOOLTIP_DELETE_STREET');
        anchorEl.appendChild(removeEl);
      }

      el.appendChild(anchorEl);
      document.querySelector('#gallery .streets').appendChild(el);
    }

    if (((mode == MODE_USER_GALLERY) && streetCount) || (mode == MODE_GLOBAL_GALLERY)) {
      _switchGalleryStreet(transmission.streets[0].id);
    }

    var el = document.querySelector('#gallery .selected');
    if (el) {
      el.scrollIntoView();
      document.querySelector('#gallery').scrollTop = 0;
    }

    _updateScrollButtons();

    _updateGalleryStreetCount();
  }

  function _loadGalleryContents() {
    var els = document.querySelectorAll('#gallery .streets li');
    for (var i = 0, el; el = els[i]; i++) {
      _removeElFromDom(el);
    }

    //document.querySelector('#gallery .streets').innerHTML = '';
    document.querySelector('#gallery .loading').classList.add('visible');
    document.querySelector('#gallery .error-loading').classList.remove('visible');

    _fetchGalleryData();  
  }

  function _showGallery(userId, instant, signInPromo) {
    galleryVisible = true;
    galleryStreetLoaded = true;
    galleryStreetId = street.id;
    galleryUserId = userId;

    if (signInPromo) {

    } else {
      if (userId) {
        document.querySelector('#gallery .avatar').setAttribute('userId', galleryUserId);
        document.querySelector('#gallery .avatar').removeAttribute('loaded');
        _fetchAvatars();
        document.querySelector('#gallery .user-id').innerHTML = galleryUserId;

        var linkEl = document.createElement('a');
        // TODO const
        linkEl.href = 'https://twitter.com/' + galleryUserId;
        linkEl.innerHTML = 'Twitter profile »';
        linkEl.classList.add('twitter-profile');
        linkEl.target = '_blank';
        document.querySelector('#gallery .user-id').appendChild(linkEl);

      } else {
        document.querySelector('#gallery .user-id').innerHTML = 'All streets';      
      }


      document.querySelector('#gallery .street-count').innerHTML = '';

      // TODO no class, but type?
      if (!userId) {
        document.querySelector('#gallery').classList.add('all-streets');
        document.querySelector('#gallery').classList.remove('another-user');
      } else if (signedIn && (userId == signInData.userId)) {
        document.querySelector('#gallery').classList.remove('another-user');
        document.querySelector('#gallery').classList.remove('all-streets');
      } else {
        document.querySelector('#gallery').classList.add('another-user'); 
        document.querySelector('#gallery').classList.remove('all-streets');
      }
    }

    _statusMessage.hide();
    document.querySelector('#gallery .sign-in-promo').classList.remove('visible');

    if (instant) {
      document.body.classList.add('gallery-no-move-transition');
    }
    document.body.classList.add('gallery-visible');

    if (instant) {
      window.setTimeout(function() {
        document.body.classList.remove('gallery-no-move-transition');
      }, 0);
    }

    if ((mode == MODE_USER_GALLERY) || (mode == MODE_GLOBAL_GALLERY)) {
      // Prevents showing old street before the proper street loads
      _showError(ERROR_NO_STREET, false);
    }

    if (!signInPromo) {
      _loadGalleryContents();
      _updatePageUrl(true);
    } else {
      document.querySelector('#gallery .sign-in-promo').classList.add('visible');
    }
  }

  function _onGalleryShieldClick(event) {
    _hideGallery(false);
  }

  function _hideGallery(instant) {
    if ((currentErrorType != ERROR_NO_STREET) && galleryStreetLoaded) {
      galleryVisible = false;

      if (instant) {
        document.body.classList.add('gallery-no-move-transition');
      }
      document.body.classList.remove('gallery-visible');

      if (instant) {
        window.setTimeout(function() {
          document.body.classList.remove('gallery-no-move-transition');
        }, 0);
      }

      _onWindowFocus();

      if (!abortEverything) {
        _updatePageUrl();
      }

      mode = MODE_CONTINUE;      
    }
  }

  function _onMyStreetsClick(event) {
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (signedIn) {
      _showGallery(signInData.userId, false);
    } else {
      _showGallery(false, false, true);
    }

    event.preventDefault();
  }

  function _onVisibilityChange() {
    var hidden = document.hidden || document.webkitHidden || 
        document.msHidden || document.mozHidden;

    if (hidden) {
      _onWindowBlur();
    } else {
      _onWindowFocus();
    }
  }

  function _isFeedbackFormMessagePresent() {
    var message = document.querySelector('#feedback-form-message').value;
    message = jQuery.trim(message);

    return message.length > 0;
  }

  function _updateFeedbackForm() {
    if (_isFeedbackFormMessagePresent()) {
      document.querySelector('#feedback-form-send').disabled = false;
    } else {
      document.querySelector('#feedback-form-send').disabled = true;
    }
  }

  function _onFeedbackFormEmailKeyDown(event) {
    if (event.keyCode == KEY_ENTER) {
      _feedbackFormSend();
    }
  }

  function _feedbackFormSend() {
    if (_isFeedbackFormMessagePresent()) {

      document.querySelector('#feedback-form .loading').classList.add('visible');

      var additionalInformation = '\nUser agent: ' + navigator.userAgent;
      if (system.ipAddress) {
        additionalInformation += '\nIP: ' + system.ipAddress;
      }
      //additionalInformation += '\nSettings: ' + JSON.stringify(settings);

      var transmission = {
        message: document.querySelector('#feedback-form-message').value,
        from: document.querySelector('#feedback-form-email').value,
        additionalInformation: additionalInformation
      };

      _newNonblockingAjaxRequest({
        // TODO const
        url: API_URL + 'v1/feedback',
        data: JSON.stringify(transmission),
        dataType: 'json',
        type: 'POST',
        contentType: 'application/json',
      }, true, _feedbackFormSuccess);
    }
  }

  function _feedbackFormSuccess() {
    document.querySelector('#feedback-form .loading').classList.remove('visible');
    document.querySelector('#feedback-form .thank-you').classList.add('visible');

    // TODO better remove
    window.localStorage[LOCAL_STORAGE_FEEDBACK_BACKUP] = '';
    window.localStorage[LOCAL_STORAGE_FEEDBACK_EMAIL_BACKUP] = '';

    // TODO const
    window.setTimeout(_hideMenus, 2500);
  }

  function _onFeedbackFormInput() {
    window.localStorage[LOCAL_STORAGE_FEEDBACK_BACKUP] = 
        document.querySelector('#feedback-form-message').value;
    window.localStorage[LOCAL_STORAGE_FEEDBACK_EMAIL_BACKUP] = 
        document.querySelector('#feedback-form-email').value;

    _updateFeedbackForm();
  }

  function _onStreetSectionScroll(event) {
    _infoBubble.suppress();

    if (!system.safari) {
      var scrollPos = document.querySelector('#street-section-outer').scrollLeft;

      var pos = -scrollPos * 0.5;
      document.querySelector('#street-section-sky .front-clouds').style[system.cssTransform] = 'translateX(' + pos + 'px)'; 

      var pos = -scrollPos * 0.25;
      document.querySelector('#street-section-sky .rear-clouds').style[system.cssTransform] = 'translateX(' + pos + 'px)'; 
    }

    if (event) {
      event.preventDefault();
    }
  }

  function _saveAsImage(event) {
    var width = TILE_SIZE * street.width + BUILDING_SPACE * 2;
    var height = 800;

    var el = document.createElement('canvas');
    el.width = width * 2;
    el.height = height * 2;

    var ctx = el.getContext('2d');

    _drawStreetThumbnail(ctx, street, width, height, 1.0, false);

    window.open(el.toDataURL('image/png'));

    event.preventDefault();
  }

  function _addEventListeners() {
    if (system.touch) {
      document.querySelector('#new-street-menu .close').addEventListener('touchstart', _hideNewStreetMenu);
    } else {
      document.querySelector('#new-street-menu .close').addEventListener('click', _hideNewStreetMenu);      
    }

    document.querySelector('#street-width-read').addEventListener('click', _onStreetWidthClick);

    document.querySelector('#save-as-image').addEventListener('click', _saveAsImage);

    document.querySelector('#street-section-outer').addEventListener('scroll', _onStreetSectionScroll);

    if (!system.touch) {
      $('#street-section-left-building').mouseenter(_onBuildingMouseEnter);
      $('#street-section-left-building').mouseleave(_onBuildingMouseLeave);
      $('#street-section-right-building').mouseenter(_onBuildingMouseEnter);
      $('#street-section-right-building').mouseleave(_onBuildingMouseLeave);
    }

    //$('.width-chart-canvas').mouseenter(_hideWidthChartImmediately);

    if (!system.touch) {
      $('.info-bubble').mouseenter(_infoBubble.onMouseEnter);
      $('.info-bubble').mouseleave(_infoBubble.onMouseLeave);
    }
    document.querySelector('.info-bubble').addEventListener('touchstart', _infoBubble.onTouchStart);

    document.querySelector('#new-street').addEventListener('click', _goNewStreet);
    document.querySelector('#copy-last-street').addEventListener('click', _goCopyLastStreet);

    document.querySelector('#feedback-form-message').addEventListener('input', _onFeedbackFormInput, false);
    document.querySelector('#feedback-form-email').addEventListener('input', _onFeedbackFormInput, false);
    document.querySelector('#feedback-form-email').addEventListener('keydown', _onFeedbackFormEmailKeyDown, false);
    document.querySelector('#feedback-form-send').addEventListener('click', _feedbackFormSend, false);

    document.querySelector('#gallery-try-again').addEventListener('click', _repeatReceiveGalleryData);

    document.querySelector('#no-connection-try-again').addEventListener('click', _nonblockingAjaxTryAgain);

    document.querySelector('#blocking-shield-cancel').addEventListener('click', _blockingCancel);
    document.querySelector('#blocking-shield-try-again').addEventListener('click', _blockingTryAgain);
    document.querySelector('#blocking-shield-reload').addEventListener('click', _goReload);
    document.querySelector('#gallery-shield').addEventListener('click', _onGalleryShieldClick);

    if (system.touch) {
      document.querySelector('#new-street-default').addEventListener('touchstart', _onNewStreetDefaultClick);
      document.querySelector('#new-street-empty').addEventListener('touchstart', _onNewStreetEmptyClick);
      document.querySelector('#new-street-last').addEventListener('touchstart', _onNewStreetLastClick);
    } else {
      document.querySelector('#new-street-default').addEventListener('click', _onNewStreetDefaultClick);
      document.querySelector('#new-street-empty').addEventListener('click', _onNewStreetEmptyClick);
      document.querySelector('#new-street-last').addEventListener('click', _onNewStreetLastClick);
    }

    window.addEventListener('storage', _onStorageChange);

    if (system.touch) {
      document.querySelector('#gallery-link a').addEventListener('touchstart', _onMyStreetsClick);
    } else {
      document.querySelector('#gallery-link a').addEventListener('click', _onMyStreetsClick);      
    }

    document.querySelector('#sign-out-link').addEventListener('click', _signOut);

    /*if (system.pageVisibility) {
      document.addEventListener('visibilitychange', _onVisibilityChange, false);
      document.addEventListener('webkitvisibilitychange', _onVisibilityChange, false);
      document.addEventListener('mozvisibilitychange', _onVisibilityChange, false);
      document.addEventListener('msvisibilitychange', _onVisibilityChange, false);
    }*/
    window.addEventListener('focus', _onWindowFocus);
    window.addEventListener('blur', _onWindowBlur);

    window.addEventListener('beforeunload', _onWindowBeforeUnload);

    if (system.touch) {
      document.querySelector('#street-name').addEventListener('touchstart', _askForStreetName);
    } else {
      document.querySelector('#street-name').addEventListener('click', _askForStreetName);      
    }

    if (system.touch) {
      document.querySelector('#undo').addEventListener('touchstart', _undo);
      document.querySelector('#redo').addEventListener('touchstart', _redo);
    } else {
      document.querySelector('#undo').addEventListener('click', _undo);
      document.querySelector('#redo').addEventListener('click', _redo);      
    }

    document.querySelector('#street-width').
        addEventListener('change', _onStreetWidthChange);

    window.addEventListener('resize', _onResize);

    $(document).mouseleave(_onBodyMouseOut);

    if (!system.touch) {
      window.addEventListener('mousedown', _onBodyMouseDown);
      window.addEventListener('mousemove', _onBodyMouseMove);
      window.addEventListener('mouseup', _onBodyMouseUp); 
    } else {
      window.addEventListener('touchstart', _onBodyMouseDown);
      window.addEventListener('touchmove', _onBodyMouseMove);
      window.addEventListener('touchend', _onBodyMouseUp); 
    }
    window.addEventListener('keydown', _onBodyKeyDown);  

    /*if (system.touch) {
      document.querySelector('#share-menu-button').
          addEventListener('touchstart', _onShareMenuClick);
      document.querySelector('#feedback-menu-button').
          addEventListener('touchstart', _onFeedbackMenuClick);
      if (document.querySelector('#identity-menu-button')) {
        document.querySelector('#identity-menu-button').
            addEventListener('touchstart', _onIdentityMenuClick);
      }
    } else {*/
      // Firefox sometimes disables some buttons… unsure why
      document.querySelector('#share-menu-button').disabled = false;
      document.querySelector('#help-menu-button').disabled = false;
      document.querySelector('#feedback-menu-button').disabled = false;
      if (document.querySelector('#identity-menu-button')) {
        document.querySelector('#identity-menu-button').disabled = false;
      }

      document.querySelector('#share-menu-button').
          addEventListener('click', _onShareMenuClick);
      document.querySelector('#help-menu-button').
          addEventListener('click', _onHelpMenuClick);
      document.querySelector('#feedback-menu-button').
          addEventListener('click', _onFeedbackMenuClick);
      if (document.querySelector('#identity-menu-button')) {
        document.querySelector('#identity-menu-button').
            addEventListener('click', _onIdentityMenuClick);
      }
    //}
  }

  function _detectEnvironment() {
    var url = location.href;

    document.body.classList.add('environment-{{env}}');
  }

  function _detectSystemCapabilities() {
    _detectEnvironment();

    system.touch = Modernizr.touch;
    //system.touch = true;  // DEBUG
    system.hiDpi = window.devicePixelRatio;
    system.pageVisibility = Modernizr.pagevisibility;

    if (system.touch) {
      document.body.classList.add('touch-support');
    }

    system.cssTransform = false;
    var el = document.createElement('div');
    for (var i in CSS_TRANSFORMS) {
      if (typeof el.style[CSS_TRANSFORMS[i]] != 'undefined') {
        system.cssTransform = CSS_TRANSFORMS[i];
        break;
      }
    }

    if ((navigator.userAgent.indexOf('Safari') != -1) && (navigator.userAgent.indexOf('Chrome') == -1)) {
      system.safari = true;

      document.body.classList.add('safari');
    }

    if (!debug.forceUnsupportedBrowser) {
      // TODO temporary ban
      if ((navigator.userAgent.indexOf('Opera') != -1) || 
          (navigator.userAgent.indexOf('Internet Explorer') != -1) ||
          (navigator.userAgent.indexOf('iPad') != -1) ||
          (navigator.userAgent.indexOf('iPhone') != -1)) {
        mode = MODE_UNSUPPORTED_BROWSER;
        _processMode();
      }    
    }
  }

  var _noConnectionMessage = {
    visible: false,
    timerId: -1,

    schedule: function() {
      if (_noConnectionMessage.timerId == -1) {
        // TODO const
        _noConnectionMessage.timerId = 
          window.setTimeout(_noConnectionMessage.show, NO_CONNECTION_MESSAGE_TIMEOUT);
      }
    },

    show: function() {
      console.log('no connection!');
      document.querySelector('#no-connection-message').classList.add('visible');
      document.body.classList.add('no-connection-message-visible');
    },

    hide: function() {
      window.clearTimeout(_noConnectionMessage.timerId);
      _noConnectionMessage.timerId = -1;

      document.querySelector('#no-connection-message').classList.remove('visible');
      document.body.classList.remove('no-connection-message-visible');
    }
  };

  function _isPointInPoly(vs, point) {
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      var xi = vs[i][0], yi = vs[i][1];
      var xj = vs[j][0], yj = vs[j][1];
      
      var intersect = ((yi > y) != (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    
    return inside;
  }

  // TODO move
  var SEGMENT_SWITCHING_TIME = 250;

  function _switchSegmentElIn(el) {
    el.classList.add('switching-in-pre');

    window.setTimeout(function() {
      var pos = _getElAbsolutePos(el);
      var perspective = -(pos[0] - document.querySelector('#street-section-outer').scrollLeft - system.viewportWidth / 2);
      // TODO const
      // TODO cross-browser

      //console.log(perspective);

      el.style.webkitPerspectiveOrigin = (perspective / 2) + 'px 50%';
      el.style.MozPerspectiveOrigin = (perspective / 2) + 'px 50%';
      el.style.perspectiveOrigin = (perspective / 2) + 'px 50%';

      el.classList.add('switching-in-post');
    }, SEGMENT_SWITCHING_TIME / 2);

    window.setTimeout(function() {
      el.classList.remove('switching-in-pre');
      el.classList.remove('switching-in-post');
    }, SEGMENT_SWITCHING_TIME * 1.5);
  }

  function _switchSegmentElAway(el) {
    var pos = _getElAbsolutePos(el);

    // TODO func
    var perspective = -(pos[0] - document.querySelector('#street-section-outer').scrollLeft - system.viewportWidth / 2);
    // TODO const
    // TODO cross-browser

    //console.log(perspective);

    el.style.webkitPerspectiveOrigin = (perspective / 2) + 'px 50%';
    el.style.MozPerspectiveOrigin = (perspective / 2) + 'px 50%';
    el.style.perspectiveOrigin = (perspective / 2) + 'px 50%';

    el.parentNode.removeChild(el);
    el.classList.remove('hover');
    el.classList.add('switching-away-pre');
    el.style.left = (pos[0] - document.querySelector('#street-section-outer').scrollLeft) + 'px';
    el.style.top = pos[1] + 'px';
    document.body.appendChild(el);

    window.setTimeout(function() {
      el.classList.add('switching-away-post');
    }, 0);

    window.setTimeout(function() {
      el.parentNode.removeChild(el);
    }, SEGMENT_SWITCHING_TIME);
  }

  var INFO_BUBBLE_TYPE_SEGMENT = 1;
  var INFO_BUBBLE_TYPE_LEFT_BUILDING = 2;
  var INFO_BUBBLE_TYPE_RIGHT_BUILDING = 3;

  var _infoBubble = {
    mouseInside: false,

    visible: false,
    el: null,

    descriptionVisible: false,

    startMouseX: null,
    startMouseY: null,
    hoverPolygon: null,
    segmentEl: null,
    type: null,

    lastMouseX: null,
    lastMouseY: null,

    suppressed: false,

    bubbleX: null,
    bubbleY: null,
    bubbleWidth: null,
    bubbleHeight: null,

    considerMouseX: null,
    considerMouseY: null,
    considerSegmentEl: null,
    considerType: null,

    hoverPolygonUpdateTimerId: -1,
    suppressTimerId: -1,

    suppress: function() {
      if (!_infoBubble.suppressed) {
        _infoBubble.hide();
        _infoBubble.hideSegment(true);
        //_infoBubble.el.classList.add('suppressed');
        _infoBubble.suppressed = true;
      }

      window.clearTimeout(_infoBubble.suppressTimerId);
      _infoBubble.suppressTimerId = window.setTimeout(_infoBubble.unsuppress, 100);
    },

    unsuppress: function() {
      //_infoBubble.el.classList.remove('suppressed');
      _infoBubble.suppressed = false;

      window.clearTimeout(_infoBubble.suppressTimerId);
    },

    onTouchStart: function() {
      _resumeFadeoutControls();
    },

    onMouseEnter: function() {
      if (_infoBubble.segmentEl) {
        _infoBubble.segmentEl.classList.add('hide-drag-handles-when-inside-info-bubble');
      }

      _infoBubble.mouseInside = true;

      _infoBubble.updateHoverPolygon();
    },

    onMouseLeave: function() {
      if (_infoBubble.segmentEl) {
        _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-inside-info-bubble');
      }

      _infoBubble.mouseInside = false;
    },

    _withinHoverPolygon: function(x, y) {
      return _isPointInPoly(_infoBubble.hoverPolygon, [x, y]);
    },

    updateHoverPolygon: function(mouseX, mouseY) {
      if (!_infoBubble.visible) {
        _infoBubble.hideDebugHoverPolygon();
        return;
      }

      // TODO move
      var MARGIN_BUBBLE = 20;
      var MARGIN_MOUSE = 10;

      var bubbleX = _infoBubble.bubbleX;
      var bubbleY = _infoBubble.bubbleY;
      var bubbleWidth = _infoBubble.bubbleWidth;
      var bubbleHeight = _infoBubble.bubbleHeight;

      if (_infoBubble.descriptionVisible) {
        var marginBubble = 50;
      } else {
        var marginBubble = MARGIN_BUBBLE;
      }

      if (_infoBubble.mouseInside) {
        var pos = _getElAbsolutePos(_infoBubble.segmentEl);

        var x = pos[0] - document.querySelector('#street-section-outer').scrollLeft;

        var segmentX1 = x - MARGIN_BUBBLE;
        var segmentX2 = x + _infoBubble.segmentEl.offsetWidth + MARGIN_BUBBLE;

        var segmentY = pos[1] + _infoBubble.segmentEl.offsetHeight + MARGIN_BUBBLE;

        _infoBubble.hoverPolygon = [
          [bubbleX - marginBubble, bubbleY - marginBubble],
          [bubbleX - marginBubble, bubbleY + bubbleHeight + marginBubble],
          [segmentX1, bubbleY + bubbleHeight + marginBubble + 120],
          [segmentX1, segmentY], 
          [segmentX2, segmentY],
          [segmentX2, bubbleY + bubbleHeight + marginBubble + 120],
          [bubbleX + bubbleWidth + marginBubble, bubbleY + bubbleHeight + marginBubble],
          [bubbleX + bubbleWidth + marginBubble, bubbleY - marginBubble],
          [bubbleX - marginBubble, bubbleY - marginBubble]
        ];
      } else {
        var bottomY = mouseY - MARGIN_MOUSE;
        if (bottomY < bubbleY + bubbleHeight + MARGIN_BUBBLE) {
          bottomY = bubbleY + bubbleHeight + MARGIN_BUBBLE;
        }
        var bottomY2 = mouseY + MARGIN_MOUSE;
        if (bottomY2 < bubbleY + bubbleHeight + MARGIN_BUBBLE) {
          bottomY2 = bubbleY + bubbleHeight + MARGIN_BUBBLE;
        }

        var diffX = 60 - (mouseY - bubbleY) / 5;
        if (diffX < 0) {
          diffX = 0;
        } else if (diffX > 50) {
          diffX = 50;
        }

        _infoBubble.hoverPolygon = [
          [bubbleX - marginBubble, bubbleY - marginBubble],
          [bubbleX - marginBubble, bubbleY + bubbleHeight + marginBubble],
          [mouseX - MARGIN_MOUSE - diffX, bottomY], 
          [mouseX - MARGIN_MOUSE, bottomY2], 
          [mouseX + MARGIN_MOUSE, bottomY2], 
          [mouseX + MARGIN_MOUSE + diffX, bottomY],
          [bubbleX + bubbleWidth + marginBubble, bubbleY + bubbleHeight + marginBubble],
          [bubbleX + bubbleWidth + marginBubble, bubbleY - marginBubble],
          [bubbleX - marginBubble, bubbleY - marginBubble]
        ];
      }

      _infoBubble.drawDebugHoverPolygon();
    },

    hideDebugHoverPolygon: function() {
      if (!debug.hoverPolygon) {
        return;
      }

      var el = document.querySelector('#debug-hover-polygon canvas');

      el.width = el.width; // clear
    },

    drawDebugHoverPolygon: function() {
      if (!debug.hoverPolygon) {
        return;
      }

      _infoBubble.hideDebugHoverPolygon();
      var el = document.querySelector('#debug-hover-polygon canvas');

      var ctx = el.getContext('2d');
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'rgba(255, 0, 0, .1)';
      ctx.beginPath();
      ctx.moveTo(_infoBubble.hoverPolygon[0][0], _infoBubble.hoverPolygon[0][1]);
      for (var i = 1; i < _infoBubble.hoverPolygon.length; i++) {
        ctx.lineTo(_infoBubble.hoverPolygon[i][0], _infoBubble.hoverPolygon[i][1]);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    },

    scheduleHoverPolygonUpdate: function() {
      window.clearTimeout(_infoBubble.hoverPolygonUpdateTimerId);

      _infoBubble.hoverPolygonUpdateTimerId = window.setTimeout(function() {
        _infoBubble.updateHoverPolygon(_infoBubble.lastMouseX, _infoBubble.lastMouseY);
      }, 50);
    },

    onBodyMouseMove: function(event) {
      var mouseX = event.pageX;
      var mouseY = event.pageY;

      _infoBubble.lastMouseX = mouseX; 
      _infoBubble.lastMouseY = mouseY;

      if (_infoBubble.visible) {
        if (!_infoBubble._withinHoverPolygon(mouseX, mouseY)) {
          _infoBubble.show(false);
        }
      }

      _infoBubble.scheduleHoverPolygonUpdate();
    },

    hideSegment: function(fast) {
      if (_infoBubble.segmentEl) {
        _infoBubble.segmentEl.classList.remove('hover');
        var el = _infoBubble.segmentEl;
        if (fast) {
          el.classList.add('immediate-show-drag-handles'); 
          window.setTimeout(function() {
            el.classList.remove('immediate-show-drag-handles'); 
          }, 0);
        } else {
          el.classList.remove('immediate-show-drag-handles');           
        }
        _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown');
        _infoBubble.segmentEl.classList.remove('show-drag-handles');
        _infoBubble.segmentEl = null;        
      }
    },

    hide: function() {
      _infoBubble.mouseInside = false;

      if (_infoBubble.descriptionVisible) {
        _infoBubble.descriptionVisible = false;
        _infoBubble.el.classList.remove('show-description');
        if (_infoBubble.segmentEl) {
          _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown');
        }
      }

      if (_infoBubble.el) {
        //_removeElFromDom(_infoBubble.el);
        //_infoBubble.el = null;
        _infoBubble.el.classList.remove('visible');
        _infoBubble.visible = false;

        document.body.removeEventListener('mousemove', _infoBubble.onBodyMouseMove);
      }
    },

    considerShowing: function(event, segmentEl, type) {
      if (menuVisible) {
        return;
      }

      if (event) {
        _infoBubble.considerMouseX = event.pageX;
        _infoBubble.considerMouseY = event.pageY;
      } else {
        var pos = _getElAbsolutePos(segmentEl);

        console.log('z');

        _infoBubble.considerMouseX = pos[0] - document.querySelector('#street-section-outer').scrollLeft;
        _infoBubble.considerMouseY = pos[1];
      }
      _infoBubble.considerSegmentEl = segmentEl;
      _infoBubble.considerType = type;

      console.log('a');

      if ((segmentEl == _infoBubble.segmentEl) && (type == _infoBubble.type)) {
        console.log('denied');
        return;
      }

      if (!_infoBubble.visible || !_infoBubble._withinHoverPolygon(mouseX, mouseY)) {
        console.log('show');
        _infoBubble.show(false);
      } 
    },

    dontConsiderShowing: function() {
      _infoBubble.considerSegmentEl = null;
      _infoBubble.considerType = null;
    },

    onBuildingVariantButtonClick: function(event, left, variantChoice) {
      if (left) {
        street.leftBuildingVariant = variantChoice;

        var el = document.querySelector('#street-section-left-building');
        el.id = 'street-section-left-building-old';

        var newEl = document.createElement('div');
        newEl.id = 'street-section-left-building';
      } else {
        street.rightBuildingVariant = variantChoice;

        var el = document.querySelector('#street-section-right-building');
        el.id = 'street-section-right-building-old';

        var newEl = document.createElement('div');
        newEl.id = 'street-section-right-building';
      }

      el.parentNode.appendChild(newEl);
      _updateBuildingPosition();
      _switchSegmentElIn(newEl);
      _switchSegmentElAway(el);

      // TODO repeat
      $(newEl).mouseenter(_onBuildingMouseEnter);
      $(newEl).mouseleave(_onBuildingMouseLeave);

      _saveStreetToServerIfNecessary();
      _createBuildings();

      _infoBubble.updateContents();
    },

    onVariantButtonClick: function(event, dataNo, variantName, variantChoice) {
      var segment = street.segments[dataNo];

      segment.variant[variantName] = variantChoice;
      segment.variantString = _getVariantString(segment.variant);

      var el = _createSegmentDom(segment);

      var oldEl = segment.el;
      oldEl.parentNode.insertBefore(el, oldEl);
      _switchSegmentElAway(oldEl);

      segment.el = el;
      segment.el.dataNo = oldEl.dataNo;
      street.segments[oldEl.dataNo].el = el;

      _switchSegmentElIn(el);
      el.classList.add('hover');
      el.classList.add('show-drag-handles');
      el.classList.add('immediate-show-drag-handles');
      el.classList.add('hide-drag-handles-when-inside-info-bubble');
      _infoBubble.segmentEl = el;

      _infoBubble.updateContents();

      _repositionSegments();
      _recalculateWidth();
      _applyWarningsToSegments();

      _saveStreetToServerIfNecessary();
    },

    getBubbleDimensions: function() {
      _infoBubble.bubbleWidth = _infoBubble.el.offsetWidth;

      if (_infoBubble.descriptionVisible) {
        var el = _infoBubble.el.querySelector('.description-canvas');
        var pos = _getElAbsolutePos(el);
        _infoBubble.bubbleHeight = pos[1] + el.offsetHeight - 38;
      } else {
        _infoBubble.bubbleHeight = _infoBubble.el.offsetHeight;        
      }

      var height = _infoBubble.bubbleHeight + 30;

      _infoBubble.el.style.webkitTransformOrigin = '50% ' + height + 'px';
      _infoBubble.el.style.MozTransformOrigin = '50% ' + height + 'px';
      _infoBubble.el.style.transformOrigin = '50% ' + height + 'px';
    },

    updateWarningsInContents: function(segment) {
      if (!_infoBubble.visible || !_infoBubble.segmentEl || 
          (_infoBubble.segmentEl != segment.el)) {
        return;
      }
      var el = _infoBubble.el.querySelector('.warnings');

      var html = '';

      if (segment.warnings[SEGMENT_WARNING_OUTSIDE]) {
        html += '<p>';
        html += msg('WARNING_DOESNT_FIT');
        html += '</p>';
      }
      if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL]) {
        html += '<p>';
        html += msg('WARNING_NOT_WIDE_ENOUGH');
        html += '</p>';
      }
      if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE]) {
        html += '<p>';
        html += msg('WARNING_TOO_WIDE');
        html += '</p>';
      }      

      if (html) {
        el.innerHTML = html;
        el.classList.add('visible');
      } else {
        el.classList.remove('visible');
      }

      _infoBubble.getBubbleDimensions();
    },

    updateWidthButtonsInContents: function(width) {
      if (width == MIN_SEGMENT_WIDTH) {
        _infoBubble.el.querySelector('.decrement').disabled = true;
      } else {
        _infoBubble.el.querySelector('.decrement').disabled = false;        
      }

      if (width == MAX_SEGMENT_WIDTH) {
        _infoBubble.el.querySelector('.increment').disabled = true;
      } else {
        _infoBubble.el.querySelector('.increment').disabled = false;        
      }
    },

    updateWidthInContents: function(segmentEl, width) {
      if (!_infoBubble.visible || !_infoBubble.segmentEl || 
          (_infoBubble.segmentEl != segmentEl)) {
        return;
      }

      _infoBubble.updateWidthButtonsInContents(width);

      var el = _infoBubble.el.querySelector('.width-canvas .width');
      if (el) {
        el.realValue = width;
        el.value = _prettifyWidth(width, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);
      } else {
        var el = _infoBubble.el.querySelector('.width-canvas .width-non-editable');
        el.innerHTML = _prettifyWidth(width, PRETTIFY_WIDTH_OUTPUT_MARKUP);
      }
    },

    createVariantIcon: function(name, buttonEl) {
      var variantIcon = VARIANT_ICONS[name];

      if (variantIcon) {
        var canvasEl = document.createElement('canvas');
        canvasEl.width = VARIANT_ICON_SIZE * system.hiDpi;
        canvasEl.height = VARIANT_ICON_SIZE * system.hiDpi;
        canvasEl.style.width = VARIANT_ICON_SIZE + 'px';
        canvasEl.style.height = VARIANT_ICON_SIZE + 'px';

        var ctx = canvasEl.getContext('2d');
        _drawSegmentImage(3, ctx, (VARIANT_ICON_START_X + variantIcon.x * 3) * TILE_SIZE, (VARIANT_ICON_START_Y + variantIcon.y * 3) * TILE_SIZE, 24, 24, 0, 0, VARIANT_ICON_SIZE, VARIANT_ICON_SIZE);
        buttonEl.appendChild(canvasEl);

        if (variantIcon.title) { 
          buttonEl.title = variantIcon.title;
        }
      }
    },

    updateContents: function() {
      var infoBubbleEl = _infoBubble.el;
      //console.log(el);

      switch (_infoBubble.type) {
        case INFO_BUBBLE_TYPE_SEGMENT:
          var segment = street.segments[parseInt(_infoBubble.segmentEl.dataNo)];
          var segmentInfo = SEGMENT_INFO[segment.type];

          var name = segmentInfo.name;
          var canBeDeleted = true;
          var showWidth = true;
          var showVariants = true;
          break;
        case INFO_BUBBLE_TYPE_LEFT_BUILDING:
          var name = 'Building';
          var canBeDeleted = false;
          var showWidth = false;
          var showVariants = false;
          break;
        case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
          var name = 'Building';
          var canBeDeleted = false;
          var showWidth = false;
          var showVariants = false;
          break;
      }

      infoBubbleEl.innerHTML = '';

      var triangleEl = document.createElement('div');
      triangleEl.classList.add('triangle');
      infoBubbleEl.appendChild(triangleEl);

      // Header

      var headerEl = document.createElement('header');

      headerEl.innerHTML = name;

      if (canBeDeleted) {
        var innerEl = document.createElement('button');
        innerEl.classList.add('remove');
        //innerEl.innerHTML = '⏏';
        _infoBubble.createVariantIcon('trashcan', innerEl);
        innerEl.segmentEl = _infoBubble.segmentEl;
        innerEl.tabIndex = -1;
        innerEl.setAttribute('title', msg('TOOLTIP_REMOVE_SEGMENT'));
        if (system.touch) {      
          innerEl.addEventListener('touchstart', _onRemoveButtonClick);
        } else {
          innerEl.addEventListener('click', _onRemoveButtonClick);        
        }
        headerEl.appendChild(innerEl);
      }

      infoBubbleEl.appendChild(headerEl);

      // Building height canvas

      if ((_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) ||
          (_infoBubble.type == INFO_BUBBLE_TYPE_RIGHT_BUILDING)) {
        var widthCanvasEl = document.createElement('div');
        widthCanvasEl.classList.add('width-canvas');

        var func = function() {
          _changeBuildingHeight(_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING, false);
        }
        var innerEl = document.createElement('button');
        innerEl.classList.add('decrement');
        innerEl.innerHTML = '–';
        innerEl.tabIndex = -1;
        innerEl.title = msg('TOOLTIP_REMOVE_FLOOR');
        if (system.touch) {
          innerEl.addEventListener('touchstart', func);
        } else {
          innerEl.addEventListener('click', func);        
        }
        widthCanvasEl.appendChild(innerEl);      

        var func = function() {
          _changeBuildingHeight(_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING, true);
        }
        var innerEl = document.createElement('button');
        innerEl.classList.add('increment');
        innerEl.innerHTML = '+';
        innerEl.tabIndex = -1;
        innerEl.title = msg('TOOLTIP_ADD_FLOOR');
        if (system.touch) {
          innerEl.addEventListener('touchstart', func);
        } else {
          innerEl.addEventListener('click', func);        
        }
        widthCanvasEl.appendChild(innerEl);      

        infoBubbleEl.appendChild(widthCanvasEl);
      }

      // Width canvas

      if (showWidth) {
        var widthCanvasEl = document.createElement('div');
        widthCanvasEl.classList.add('width-canvas');

        if (!segmentInfo.variants[0]) {
          widthCanvasEl.classList.add('entire-info-bubble');
        }

        var innerEl = document.createElement('button');
        innerEl.classList.add('decrement');
        innerEl.innerHTML = '–';
        innerEl.segmentEl = segment.el;
        innerEl.title = msg('TOOLTIP_DECREASE_WIDTH');
        innerEl.tabIndex = -1;
        if (system.touch) {
          innerEl.addEventListener('touchstart', _onWidthDecrementClick);
        } else {
          innerEl.addEventListener('click', _onWidthDecrementClick);        
        }
        innerEl.addEventListener('mouseover', _showWidthChart);
        innerEl.addEventListener('mouseout', _hideWidthChart);
        widthCanvasEl.appendChild(innerEl);        

        if (!system.touch) {
          var innerEl = document.createElement('input');
          innerEl.setAttribute('type', 'text');
          innerEl.classList.add('width');
          innerEl.segmentEl = segment.el;

          innerEl.addEventListener('click', _onWidthEditClick);
          innerEl.addEventListener('focus', _onWidthEditFocus);
          innerEl.addEventListener('blur', _onWidthEditBlur);
          innerEl.addEventListener('input', _onWidthEditInput);
          innerEl.addEventListener('mouseover', _onWidthEditMouseOver);
          innerEl.addEventListener('mouseout', _onWidthEditMouseOut);
          innerEl.addEventListener('keydown', _onWidthEditKeyDown);

          //innerEl.addEventListener('focus', _showWidthChartImmediately);
          innerEl.addEventListener('mouseover', _showWidthChart);
          innerEl.addEventListener('mouseout', _hideWidthChart);
        } else {
          var innerEl = document.createElement('span');
          innerEl.classList.add('width-non-editable');
        }
        widthCanvasEl.appendChild(innerEl);


        var innerEl = document.createElement('button');
        innerEl.classList.add('increment');
        innerEl.innerHTML = '+';
        innerEl.segmentEl = segment.el;
        innerEl.tabIndex = -1;
        innerEl.title = msg('TOOLTIP_INCREASE_WIDTH');
        if (system.touch) {
          innerEl.addEventListener('touchstart', _onWidthIncrementClick);
        } else {
          innerEl.addEventListener('click', _onWidthIncrementClick);        
        }
        innerEl.addEventListener('mouseover', _showWidthChart);
        innerEl.addEventListener('mouseout', _hideWidthChart);
        widthCanvasEl.appendChild(innerEl);        

        infoBubbleEl.appendChild(widthCanvasEl);
      }

      // Variants

      var variantsEl = document.createElement('div');
      variantsEl.classList.add('variants');

      switch (_infoBubble.type) {
        case INFO_BUBBLE_TYPE_SEGMENT:
          var first = true;

          for (var i in segmentInfo.variants) {
            if (!first) {
              var el = document.createElement('hr');
              variantsEl.appendChild(el);
            } else {
              first = false;
            }

            for (var j in VARIANTS[segmentInfo.variants[i]]) {
              var variantName = segmentInfo.variants[i];
              var variantChoice = VARIANTS[segmentInfo.variants[i]][j];

              var el = document.createElement('button');
              _infoBubble.createVariantIcon(variantName + VARIANT_SEPARATOR + variantChoice, el);

              if (segment.variant[variantName] == variantChoice) {
                el.disabled = true;
              }

              if (system.touch) {
                el.addEventListener('touchstart', (function(dataNo, variantName, variantChoice) {
                  return function() {
                    _infoBubble.onVariantButtonClick(null, dataNo, variantName, variantChoice);
                  }
                })(segment.el.dataNo, variantName, variantChoice));
              } else {
                el.addEventListener('click', (function(dataNo, variantName, variantChoice) {
                  return function() {
                    _infoBubble.onVariantButtonClick(null, dataNo, variantName, variantChoice);
                  }
                })(segment.el.dataNo, variantName, variantChoice));
              }

              variantsEl.appendChild(el);
            }
          }      
          break;
        case INFO_BUBBLE_TYPE_LEFT_BUILDING:
        case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
          if (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) {
            var variant = street.leftBuildingVariant;
          } else {
            var variant = street.rightBuildingVariant;
          }

          for (var j in BUILDING_VARIANTS) {
            var el = document.createElement('button');
            // TODO const
            _infoBubble.createVariantIcon('building' + VARIANT_SEPARATOR + BUILDING_VARIANTS[j], el);
            if (BUILDING_VARIANTS[j] == variant) {
              el.disabled = true;
            }

            variantsEl.appendChild(el);

            if (system.touch) {
              el.addEventListener('touchstart', (function(left, variantChoice) {
                return function() {
                  _infoBubble.onBuildingVariantButtonClick(null, left, variantChoice);
                }
              })(_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING, BUILDING_VARIANTS[j]));
            } else {
              el.addEventListener('click', (function(left, variantChoice) {
                return function() {
                  _infoBubble.onBuildingVariantButtonClick(null, left, variantChoice);
                }
              })(_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING, BUILDING_VARIANTS[j]));
            }
          }

          break;
      }

      infoBubbleEl.appendChild(variantsEl);

      // Warnings

      var el = document.createElement('div');
      el.classList.add('warnings');

      infoBubbleEl.appendChild(el);

      if (segmentInfo && segmentInfo.description) {
        var el = document.createElement('div');
        el.classList.add('description-prompt');
        el.innerHTML = segmentInfo.descriptionPrompt;
        if (system.touch) {
          el.addEventListener('touchstart', _infoBubble.showDescription);
        } else {
          el.addEventListener('click', _infoBubble.showDescription);
        }
        $(el).mouseenter(_infoBubble.highlightTriangle);
        $(el).mouseleave(_infoBubble.unhighlightTriangle);
        infoBubbleEl.appendChild(el);

        var el = document.createElement('div');
        el.classList.add('description-canvas');

        var innerEl = document.createElement('div');
        innerEl.classList.add('description');
        innerEl.innerHTML = segmentInfo.description;
        el.appendChild(innerEl);

        var els = innerEl.querySelectorAll('a');
        for (var i = 0, anchorEl; anchorEl = els[i]; i++) {
          anchorEl.target = '_blank';
        }

        var innerEl = document.createElement('div');
        innerEl.classList.add('description-close');
        innerEl.innerHTML = 'Close';
        if (system.touch) {
          innerEl.addEventListener('touchstart', _infoBubble.hideDescription);
        } else {
          innerEl.addEventListener('click', _infoBubble.hideDescription);          
        }
        $(innerEl).mouseenter(_infoBubble.highlightTriangle);
        $(innerEl).mouseleave(_infoBubble.unhighlightTriangle);
        el.appendChild(innerEl);
      }

      var innerEl = document.createElement('div');
      innerEl.classList.add('triangle');
      el.appendChild(innerEl);

      infoBubbleEl.appendChild(el);

      window.setTimeout(function() {
        if (_infoBubble.type == INFO_BUBBLE_TYPE_SEGMENT) {
          _infoBubble.updateWidthInContents(segment.el, segment.width);
          _infoBubble.updateWarningsInContents(segment);
        }
      }, 0);
    },

    highlightTriangle: function() {
      _infoBubble.el.classList.add('highlight-triangle');
    },

    unhighlightTriangle: function() {
      _infoBubble.el.classList.remove('highlight-triangle');
    },

    unhighlightTriangleDelayed: function() {
      window.setTimeout(function() { _infoBubble.unhighlightTriangle(); }, 200);
    },

    showDescription: function() {
      _infoBubble.descriptionVisible = true;

      var el = _infoBubble.el.querySelector('.description-canvas');
      el.style.height = (streetSectionTop + 100 - _infoBubble.bubbleY) + 'px';

      _infoBubble.el.classList.add('show-description');
      if (_infoBubble.segmentEl) {
        _infoBubble.segmentEl.classList.add('hide-drag-handles-when-description-shown');
      }
      _infoBubble.unhighlightTriangleDelayed();
      window.setTimeout(function() {
        _infoBubble.getBubbleDimensions();
        _infoBubble.updateHoverPolygon();
      }, 500);
    },

    hideDescription: function() {
      _infoBubble.descriptionVisible = false;
      _infoBubble.el.classList.remove('show-description');
      if (_infoBubble.segmentEl) {
        _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown');
      }

      _infoBubble.getBubbleDimensions();
      _infoBubble.unhighlightTriangleDelayed();
      _infoBubble.updateHoverPolygon();
    },

    // TODO rename
    show: function(force) {
      if (_infoBubble.suppressed) {
        console.log('suppressed');
        window.setTimeout(_infoBubble.show, 100);
        return;
      }

      if (draggingType != DRAGGING_TYPE_NONE) {
        return;
      }

      if (!_infoBubble.considerType) {
        _infoBubble.hide();
        _infoBubble.hideSegment(false);
        return;
      }

      var segmentEl = _infoBubble.considerSegmentEl;
      var type = _infoBubble.considerType;

      if ((segmentEl == _infoBubble.segmentEl) && 
          (type == _infoBubble.type) && !force) {
        return;
      }
      _infoBubble.hideSegment(true);

      var mouseX = _infoBubble.considerMouseX;
      var mouseY = _infoBubble.considerMouseY;

      _infoBubble.segmentEl = segmentEl;
      _infoBubble.type = type;

      if (segmentEl) {
        segmentEl.classList.add('hover');
        segmentEl.classList.add('show-drag-handles');
      }
      if (_infoBubble.visible) {
        segmentEl.classList.add('immediate-show-drag-handles');

        if (_infoBubble.descriptionVisible) {
          _infoBubble.descriptionVisible = false;
          _infoBubble.el.classList.remove('show-description');
          if (_infoBubble.segmentEl) {
            _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-description-shown');
          }
        }
      }

      _infoBubble.startMouseX = mouseX;
      _infoBubble.startMouseY = mouseY;

      var pos = _getElAbsolutePos(segmentEl);
      var bubbleX = pos[0] - document.querySelector('#street-section-outer').scrollLeft;
      var bubbleY = pos[1];

      //console.log(segmentEl, bubbleY);

      _infoBubble.el = document.querySelector('#main-screen .info-bubble');
      _infoBubble.updateContents();

      var bubbleWidth = _infoBubble.el.offsetWidth;
      var bubbleHeight = _infoBubble.el.offsetHeight;

      // TODO const
      bubbleY -= bubbleHeight - 20;
      if (bubbleY < 50) {
        bubbleY = 50;
      }

      bubbleX += segmentEl.offsetWidth / 2;
      bubbleX -= bubbleWidth / 2;

      // TODO const
      if (bubbleX < 20) {
        bubbleX = 20;
      } else if (bubbleX > system.viewportWidth - bubbleWidth - 20) {
        bubbleX = system.viewportWidth - bubbleWidth - 20;
      }

      _infoBubble.el.style.left = bubbleX + 'px';
      _infoBubble.el.style.top = bubbleY + 'px';
      
      if (!_infoBubble.visible) {
        _infoBubble.visible = true;

      }
      _infoBubble.el.classList.add('visible');

      _infoBubble.bubbleX = bubbleX;
      _infoBubble.bubbleY = bubbleY;
      _infoBubble.bubbleWidth = bubbleWidth;
      _infoBubble.bubbleHeight = bubbleHeight;

      _infoBubble.updateHoverPolygon(mouseX, mouseY);
      document.body.addEventListener('mousemove', _infoBubble.onBodyMouseMove);
    }
  };

  var _statusMessage = {
    timerId: -1,

    show: function(text, undo) {
      window.clearTimeout(_statusMessage.timerId);

      document.querySelector('#status-message > div').innerHTML = text;

      if (undo) {
        var buttonEl = document.createElement('button');
        buttonEl.innerHTML = msg('BUTTON_UNDO');
        buttonEl.addEventListener('click', _undo);
        document.querySelector('#status-message > div').appendChild(buttonEl);
      }

      var el = document.createElement('button');
      el.classList.add('close');
      if (system.touch) {
        el.addEventListener('touchstart', _statusMessage.hide);
      } else {
        el.addEventListener('click', _statusMessage.hide);        
      }
      el.innerHTML = '×';
      document.querySelector('#status-message > div').appendChild(el);      

      document.querySelector('#status-message').classList.add('visible');

      _statusMessage.timerId = 
          window.setTimeout(_statusMessage.hide, STATUS_MESSAGE_HIDE_DELAY);
    },

    hide: function() {
      document.querySelector('#status-message').classList.remove('visible');
    }
  };


  function _isUndoAvailable() {
    // Don’t allow undo/redo unless you own the street

    return (undoPosition > 0) && !remixOnFirstEdit;
  }

  function _isRedoAvailable() {
    // Don’t allow undo/redo unless you own the street

    return (undoPosition < undoStack.length - 1) && !remixOnFirstEdit;
  }

  function _updateUndoButtons() {
    document.querySelector('#undo').disabled = !_isUndoAvailable();
    document.querySelector('#redo').disabled = !_isRedoAvailable();
  }

  function _hideLoadingScreen() {
    document.querySelector('#loading').classList.add('hidden');
  }

  function _hideMenus() {
    _loseAnyFocus();

    menuVisible = false;

    var els = document.querySelectorAll('.menu.visible');
    for (var i = 0, el; el = els[i]; i++) {
      el.classList.remove('visible');
    }
  }

  function _prepareFeedbackForm() {
    if (!system.touch) {
      window.setTimeout(function() {
        document.querySelector('#feedback-form-message').focus();
      }, 200);
    }
    
    var message = window.localStorage[LOCAL_STORAGE_FEEDBACK_BACKUP] || '';
    document.querySelector('#feedback-form-message').value = message;

    var email = window.localStorage[LOCAL_STORAGE_FEEDBACK_EMAIL_BACKUP] || '';
    document.querySelector('#feedback-form-email').value = email;

    _updateFeedbackForm();

    document.querySelector('#feedback-form .loading').classList.remove('visible');
    document.querySelector('#feedback-form .thank-you').classList.remove('visible');
  }

  // TODO move

  var menuVisible = false;

  function _onFeedbackMenuClick() {
    var el = document.querySelector('#feedback-menu');

    _infoBubble.hide();
    _statusMessage.hide();

    if (!el.classList.contains('visible')) {
      _hideMenus();
      menuVisible = true;

      el.classList.add('visible');

      _prepareFeedbackForm();
    } else {
      _hideMenus();
    }
  }

  function _onHelpMenuClick() {
    var el = document.querySelector('#help-menu');

    _infoBubble.hide();
    _statusMessage.hide();

    if (!el.classList.contains('visible')) {
      _hideMenus();
      menuVisible = true;

      el.classList.add('visible');

      _prepareFeedbackForm();
    } else {
      _hideMenus();
    }
  }  

  function _onShareMenuClick() {
    var el = document.querySelector('#share-menu');

    _infoBubble.hide();
    _statusMessage.hide();

    if (!el.classList.contains('visible')) {
      _hideMenus();
      menuVisible = true;

      el.classList.add('visible');

      if (!system.touch) {
        window.setTimeout(function() {
          document.querySelector('#share-via-link').focus();
          document.querySelector('#share-via-link').select();
        }, 200);
      }
    } else {
      _hideMenus();
    }
  }

  function _onIdentityMenuClick() {
    var el = document.querySelector('#identity-menu');

    _infoBubble.hide();
    _statusMessage.hide();

    if (!el.classList.contains('visible')) {
      _hideMenus();
      menuVisible = true;

      var pos = _getElAbsolutePos(document.querySelector('#identity'));
      el.style.left = pos[0] + 'px';

      el.classList.add('visible');
    } else {
      _hideMenus();
    }
  }

  function _mergeAndFillDefaultSettings(secondSettings) {
    // Merge with local settings

    if (!settings.newStreetPreference) {
      settings.newStreetPreference = secondSettings.newStreetPreference;
    }
    if (typeof settings.lastStreetId === 'undefined') {
      settings.lastStreetId = secondSettings.lastStreetId;
    }
    if (typeof settings.lastStreetNamespacedId === 'undefined') {
      settings.lastStreetNamespacedId = secondSettings.lastStreetNamespacedId;
    }
    if (typeof settings.lastStreetCreatorId === 'undefined') {
      settings.lastStreetCreatorId = secondSettings.lastStreetCreatorId;
    }

    // Provide defaults if the above failed

    if (!settings.newStreetPreference) {
      settings.newStreetPreference = NEW_STREET_DEFAULT;
    }
    if (typeof settings.lastStreetId === 'undefined') {
      settings.lastStreetId = null;
    }
    if (typeof settings.lastStreetNamespacedId === 'undefined') {
      settings.lastStreetNamespacedId = null;
    }
    if (typeof settings.lastStreetCreatorId === 'undefined') {
      settings.lastStreetCreatorId = null;
    }
  }

  function _loadSettings() {
    if (signedIn && signInData.details) {
      var serverSettings = signInData.details.data;
    } else {
      var serverSettings = {};
    }

    // TODO handle better if corrupted
    if (window.localStorage[LOCAL_STORAGE_SETTINGS_ID]) {
      var localSettings = JSON.parse(window.localStorage[LOCAL_STORAGE_SETTINGS_ID]);
    } else {
      var localSettings = {};
    }

    settings = {};

    if (serverSettings) {
      settings = serverSettings;
    } 
    _mergeAndFillDefaultSettings(localSettings);

    if (mode == MODE_JUST_SIGNED_IN) {
      settings.lastStreetId = localSettings.lastStreetId;
      settings.lastStreetNamespacedId = localSettings.lastStreetNamespacedId;
      settings.lastStreetCreatorId = localSettings.lastStreetCreatorId;
    }

    settings.priorLastStreetId = settings.lastStreetId;

    _saveSettingsLocally();
  }

  function _trimSettings() {
    var data = {};

    data.lastStreetId = settings.lastStreetId;
    data.lastStreetNamespacedId = settings.lastStreetNamespacedId;
    data.lastStreetCreatorId = settings.lastStreetCreatorId;

    data.newStreetPreference = settings.newStreetPreference;

    return data;
  }

  function _saveSettingsLocally() {
    window.localStorage[LOCAL_STORAGE_SETTINGS_ID] = 
        JSON.stringify(_trimSettings());

    _scheduleSavingSettingsToServer();  
  }

  function _normalizeAllSegmentWidths() {
    for (var i in street.segments) {
      street.segments[i].width = 
          _normalizeSegmentWidth(street.segments[i].width, RESIZE_TYPE_INITIAL);
    }
  }

  function _updateUnits(newUnits) {
    if (street.units == newUnits) {
      return;
    }

    units = newUnits;
    street.units = newUnits;

    // If the user converts and then straight converts back, we just reach
    // to undo stack instead of double conversion (which could be lossy).
    if (undoStack[undoPosition - 1] && 
        (undoStack[undoPosition - 1].units == newUnits)) {
      var fromUndo = true;
    } else {
      var fromUndo = false;
    }

    _propagateUnits();

    ignoreStreetChanges = true;
    if (!fromUndo) {
      _normalizeAllSegmentWidths();

      if (street.remainingWidth == 0) {
        street.width = 0;
        for (var i in street.segments) {
          street.width += street.segments[i].width;
        }
      } else {
        street.width = _normalizeStreetWidth(street.width);
      }
    } else {
      street = _clone(undoStack[undoPosition - 1]);
    }
    _createDomFromData();
    _segmentsChanged();
    _resizeStreetWidth();

    ignoreStreetChanges = false;      

    _buildStreetWidthMenu();
    _hideMenus();

    _saveStreetToServerIfNecessary();
    _saveSettingsLocally();
  }

  function _propagateUnits() {
    switch (street.units) {
      case SETTINGS_UNITS_IMPERIAL:
        segmentWidthResolution = SEGMENT_WIDTH_RESOLUTION_IMPERIAL;
        segmentWidthClickIncrement = SEGMENT_WIDTH_CLICK_INCREMENT_IMPERIAL;
        segmentWidthDraggingResolution = 
            SEGMENT_WIDTH_DRAGGING_RESOLUTION_IMPERIAL;
        break;
      case SETTINGS_UNITS_METRIC:
        segmentWidthResolution = SEGMENT_WIDTH_RESOLUTION_METRIC;
        segmentWidthClickIncrement = SEGMENT_WIDTH_CLICK_INCREMENT_METRIC;
        segmentWidthDraggingResolution = 
            SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC;
        break;
    }

    _buildStreetWidthMenu();
  }

  function _getPageTitle() {
    return street.name + '– Streetmix';
  }

  function _getSharingMessage() {
    var message = '';

    if (signedIn) {
      if (!street.creatorId) {
        message = 'Check out ' + street.name + ' street on Streetmix!';
      } else if (street.creatorId == signInData.userId) {
        message = 'Check out my street, ' + street.name + ', on Streetmix!';
      } else {
        message = 'Check out ' + street.name + ' street by @' + street.creatorId + ' on Streetmix!';
      }
    } else {
      message = 'Check out ' + street.name + ' street on Streetmix!';
    }

    return message;
  }

  function _updateFacebookLink(url) {
    var el = document.querySelector('#share-via-facebook');

    var text = _getSharingMessage();

    var appId = FACEBOOK_APP_ID;

    // TODO const
    el.href = 'https://www.facebook.com/dialog/feed' +
        '?app_id=' + encodeURIComponent(appId) +
        '&redirect_uri=' + encodeURIComponent(url) + 
        '&link=' + encodeURIComponent(url) + 
        '&name=' + encodeURIComponent(_getPageTitle()) +
        '&description=' + encodeURIComponent(htmlEncode(text));
  }

  function _updateTwitterLink(url) {
    var el = document.querySelector('#share-via-twitter');

    var text = _getSharingMessage();

    // TODO const
    el.href = 'https://twitter.com/intent/tweet' + 
        '?text=' + encodeURIComponent(text) + 
        '&url=' + encodeURIComponent(url);
  }

  function _updateNakedLink(url) {
    document.querySelector('#share-via-link').value = url;
  }

  function _getSharingUrl() {
    var url = location.href;

    return url;
  }

  function _updateShareMenu() {
    var url = _getSharingUrl();

    _updateNakedLink(url);
    _updateTwitterLink(url);
    _updateFacebookLink(url);

    if (!signedIn) {
      document.querySelector('#sign-in-promo').classList.add('visible');
    }
  }

  function _updateFeedbackMenu() {
    var el = document.querySelector('#feedback-via-twitter');

    var text = TWITTER_ID;
    var url = _getSharingUrl();

    // TODO const
    el.href = 'https://twitter.com/intent/tweet' + 
        '?text=' + encodeURIComponent(text) + 
        '&url=' + encodeURIComponent(url);    
  }

  function _prepareDefaultStreet() {
    street.units = units;
    _propagateUnits();
    street.name = DEFAULT_NAME;
    street.width = _normalizeStreetWidth(DEFAULT_STREET_WIDTH);
    street.leftBuildingHeight = DEFAULT_BUILDING_HEIGHT_LEFT;
    street.rightBuildingHeight = DEFAULT_BUILDING_HEIGHT_RIGHT;
    street.leftBuildingVariant = DEFAULT_BUILDING_VARIANT_LEFT;
    street.rightBuildingVariant = DEFAULT_BUILDING_VARIANT_RIGHT;
    if (signedIn) {
      _setStreetCreatorId(signInData.userId);
    }

    _fillDefaultSegments();    

    _setUpdateTimeToNow();
  }

  function _prepareEmptyStreet() {
    street.units = units;
    _propagateUnits();

    street.name = DEFAULT_NAME;
    street.width = _normalizeStreetWidth(DEFAULT_STREET_WIDTH);
    street.leftBuildingHeight = DEFAULT_BUILDING_HEIGHT_EMPTY;
    street.rightBuildingHeight = DEFAULT_BUILDING_HEIGHT_EMPTY;
    street.leftBuildingVariant = DEFAULT_BUILDING_VARIANT_EMPTY;
    street.rightBuildingVariant = DEFAULT_BUILDING_VARIANT_EMPTY;
    if (signedIn) {
      _setStreetCreatorId(signInData.userId);
    }

    street.segments = [];

    _setUpdateTimeToNow();
  }

  function _onScrollButtonLeft(event) {
    var el = event.target.el;
    // TODO const
    $(el).animate({ scrollLeft: el.scrollLeft - (el.offsetWidth - 150) }, 300);
  }

  function _onScrollButtonRight(event) {
    var el = event.target.el;

    // TODO const
    $(el).animate({ scrollLeft: el.scrollLeft + (el.offsetWidth - 150) }, 300);
  }

  function _onScrollButtonScroll(event) {
    _scrollButtonScroll(event.target);
  }

  function _scrollButtonScroll(el) {
    if (el.scrollLeft == 0) {
      el.parentNode.querySelector('button.scroll-left').disabled = true;
    } else {
      el.parentNode.querySelector('button.scroll-left').disabled = false;      
    }

    if (el.scrollLeft == el.scrollWidth - el.offsetWidth) {
      el.parentNode.querySelector('button.scroll-right').disabled = true;
    } else {
      el.parentNode.querySelector('button.scroll-right').disabled = false;      
    }
  }

  function _repositionScrollButtons(el) {
    var buttonEl = el.parentNode.querySelector('button.scroll-left');
    buttonEl.style.left = _getElAbsolutePos(el)[0] + 'px';

    var buttonEl = el.parentNode.querySelector('button.scroll-right');
    buttonEl.style.left = (_getElAbsolutePos(el)[0] + el.offsetWidth) + 'px';
  }

  function _addScrollButtons(el) {
    var buttonEl = document.createElement('button');
    buttonEl.innerHTML = '«';
    buttonEl.classList.add('scroll-left');
    buttonEl.el = el;
    buttonEl.disabled = true;
    if (system.touch) {      
      buttonEl.addEventListener('touchstart', _onScrollButtonLeft);
    } else {
      buttonEl.addEventListener('click', _onScrollButtonLeft);        
    }
    el.parentNode.appendChild(buttonEl);

    var buttonEl = document.createElement('button');
    buttonEl.innerHTML = '»';
    buttonEl.classList.add('scroll-right');
    buttonEl.el = el;
    buttonEl.disabled = true;
    if (system.touch) {      
      buttonEl.addEventListener('touchstart', _onScrollButtonRight);
    } else {
      buttonEl.addEventListener('click', _onScrollButtonRight);        
    }
    el.parentNode.appendChild(buttonEl);

    el.setAttribute('scroll-buttons', true);
    el.addEventListener('scroll', _onScrollButtonScroll);

    _repositionScrollButtons(el);
    _scrollButtonScroll(el);
  }

  function _prepareSegmentInfo() {
    // TODO should not modify const

    for (var i in SEGMENT_INFO) {
      for (var j in SEGMENT_INFO[i].details) {
        var graphics = SEGMENT_INFO[i].details[j].graphics;

        if (graphics.repeat && !jQuery.isArray(graphics.repeat)) {
          graphics.repeat = [graphics.repeat];
        }
        if (graphics.left && !jQuery.isArray(graphics.left)) {
          graphics.left = [graphics.left];
        }
        if (graphics.right && !jQuery.isArray(graphics.right)) {
          graphics.right = [graphics.right];
        }
        if (graphics.center && !jQuery.isArray(graphics.center)) {
          graphics.center = [graphics.center];
        }
      }
    }
  }

  function _onEverythingLoaded() {
    switch (mode) {
      case MODE_NEW_STREET:
        _showNewStreetMenu();
        break;
      case MODE_NEW_STREET_COPY_LAST:
        _onNewStreetLastClick();
        break;
    }

    _onResize();
    _resizeStreetWidth();
    _updateStreetName();
    _createPalette();
    _createDomFromData();
    _segmentsChanged();
    _updateShareMenu();
    _updateFeedbackMenu();

    initializing = false;    
    ignoreStreetChanges = false;
    lastStreet = _trimStreetData(street);

    _updatePageUrl();
    _buildStreetWidthMenu();
    _addScrollButtons(document.querySelector('#palette'));
    _addScrollButtons(document.querySelector('#gallery .streets'));
    _addEventListeners();

    if (mode == MODE_USER_GALLERY) {
      _showGallery(galleryUserId, true);
    } else if (mode == MODE_GLOBAL_GALLERY) {
      _showGallery(null, true);
    }

    if (promoteStreet) {
      _remixStreet();
    }

    window.setTimeout(_hideLoadingScreen, 0);
  }

  function _drawStreetThumbnail(ctx, street, thumbnailWidth, thumbnailHeight, multiplier, silhouette) {
    var occupiedWidth = 0;
    for (var i in street.segments) {
      occupiedWidth += street.segments[i].width;
    }

    var offsetTop = (thumbnailHeight + 5 * TILE_SIZE * multiplier) / 2;
    var offsetLeft = (thumbnailWidth - occupiedWidth * TILE_SIZE * multiplier) / 2;

    var groundLevel = offsetTop + 140 * multiplier;

    ctx.fillStyle = BACKGROUND_DIRT_COLOUR;
    ctx.fillRect(0, groundLevel * system.hiDpi, thumbnailWidth * system.hiDpi, thumbnailHeight * system.hiDpi);

    var buildingWidth = offsetLeft / multiplier;

    var x = thumbnailWidth / 2 - street.width * TILE_SIZE * multiplier / 2;
    _drawBuilding(ctx, street, true, buildingWidth, groundLevel, true, x - (buildingWidth - 25) * multiplier, 0, multiplier);

    var x = thumbnailWidth / 2 + street.width * TILE_SIZE * multiplier / 2;
    _drawBuilding(ctx, street, false, buildingWidth, groundLevel, true, x - 25 * multiplier, 0, multiplier);

    for (var i in street.segments) {
      var segment = street.segments[i];
      var segmentInfo = SEGMENT_INFO[segment.type];
      var variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString];
      var dimensions = _getVariantInfoDimensions(variantInfo, segment.width * TILE_SIZE, 1);

      _drawSegmentContents(ctx, segment.type, segment.variantString, 
          segment.width * TILE_SIZE * multiplier, 
          offsetLeft + dimensions.left * TILE_SIZE * multiplier, offsetTop, multiplier, false);

      offsetLeft += segment.width * TILE_SIZE * multiplier;
    }

    if (silhouette) {
      ctx.globalCompositeOperation = 'source-atop';
      // TODO const
      ctx.fillStyle = 'rgb(240, 240, 240)';
      ctx.fillRect(0, 0, thumbnailWidth * system.hiDpi, thumbnailHeight * system.hiDpi);
    }
  }

  function _checkIfEverythingIsLoaded() {
    if (abortEverything) {
      return;
    }

    if ((imagesToBeLoaded == 0) && signInLoaded && bodyLoaded && 
        readyStateCompleteLoaded && countryLoaded && serverContacted) {
      _onEverythingLoaded();
    }
  }

  function _onImageLoaded() {
    imagesToBeLoaded--;
    document.querySelector('#loading-progress').value++;

    _checkIfEverythingIsLoaded();
  }

  function _loadImages() {
    imagesToBeLoaded = IMAGES_TO_BE_LOADED.length;

    for (var i in IMAGES_TO_BE_LOADED) {
      var url = IMAGES_TO_BE_LOADED[i];

      images[url] = document.createElement('img');
      images[url].addEventListener('load', _onImageLoaded);
      images[url].src = url + '?v' + TILESET_IMAGE_VERSION;
    }    


    // signInLoaded && bodyLoaded && readyStateCompleteLoaded && countryLoaded && serverContacted
    document.querySelector('#loading-progress').value = 0;
    document.querySelector('#loading-progress').max = imagesToBeLoaded + 5;
  }

  function _saveSignInDataLocally() {
    if (signInData) {
      window.localStorage[LOCAL_STORAGE_SIGN_IN_ID] = JSON.stringify(signInData);
    } else {
      window.localStorage[LOCAL_STORAGE_SIGN_IN_ID] = '';
    }
  }

  function _removeSignInCookies() {
    $.removeCookie(SIGN_IN_TOKEN_COOKIE);
    $.removeCookie(USER_ID_COOKIE);
  }

  function _loadSignIn() {
    signInLoaded = false;

    var signInCookie = $.cookie(SIGN_IN_TOKEN_COOKIE);
    var userIdCookie = $.cookie(USER_ID_COOKIE);

    if (signInCookie && userIdCookie) {
      signInData = { token: signInCookie, userId: userIdCookie };

      _removeSignInCookies();
      _saveSignInDataLocally();
    } else {
      if (window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]) {
        signInData = JSON.parse(window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]);
      }
    }

    if (signInData && signInData.token && signInData.userId) {
      _fetchSignInDetails();

      // This block was commented out because caching username causes 
      // failures when the database is cleared. TODO Perhaps we should
      // be handling this more deftly.
      /*if (signInData.details) {
        signedIn = true;
        _signInLoaded();
      } else {
        _fetchSignInDetails();
      }*/

    } else {
      signedIn = false;
      _signInLoaded();
    }
  }

  function _fetchSignInDetails() {
    // TODO const
    jQuery.ajax({
      url: API_URL + 'v1/users/' + signInData.userId,
      dataType: 'json',
      headers: { 'Authorization': _getAuthHeader() }
    }).done(_receiveSignInDetails).fail(_errorReceiveSignInDetails);
  }

  function _receiveSignInDetails(details) {
    //console.log('receive sign in details', details);

    signInData.details = details;
    _saveSignInDataLocally();

    _receiveAvatar(details);

    signedIn = true;
    _signInLoaded();
  }

  function _errorReceiveSignInDetails(data) {   
    // If we get data.status == 0, it means that the user opened the page and
    // closed is quickly, so the request was aborted. We choose to do nothing
    // instead of clobbering sign in data below and effectively signing the
    // user out. Issue #302.

    // It also, unfortunately, might mean regular server failure, too. Marcin
    // doesn’t know what to do with it yet. Open issue #339.

    //console.log(data);

    /*if (data.status == 0) {
      _showError(ERROR_NEW_STREET_SERVER_FAILURE, true);
      return;
    }*/

    // Fail silently

    signInData = null;
    //_saveSignInDataLocally();

    signedIn = false;
    _signInLoaded();
  }

  function _signOut(event) {
    settings.lastStreetId = null;
    settings.lastStreetNamespacedId = null;
    settings.lastStreetCreatorId = null;
    _saveSettingsLocally();

    _removeSignInCookies();
    window.localStorage.removeItem(LOCAL_STORAGE_SIGN_IN_ID);
    _sendSignOutToServer();

    event.preventDefault();
  }

  function _getAuthHeader() {
    if (signInData && signInData.token) {
      return 'Streetmix realm="" loginToken="' + signInData.token + '"'
    } else {
      return '';
    }
  }

  function _sendSignOutToServer() {
    jQuery.ajax({
      // TODO const
      url: API_URL + 'v1/users/' + signInData.userId + '/login-token',
      dataType: 'json',
      type: 'DELETE',
      headers: { 'Authorization': _getAuthHeader() }
    }).done(_receiveSignOutConfirmationFromServer)
    .fail(_errorReceiveSignOutConfirmationFromServer);
  }

    function _receiveSignOutConfirmationFromServer() {
      mode = MODE_SIGN_OUT;
      _processMode();
    }

    function _errorReceiveSignOutConfirmationFromServer() {
    mode = MODE_SIGN_OUT;
    _processMode();
  }

  function _createSignInUI() {
    if (signedIn) {
      var el = document.createElement('div');
      //el.style.backgroundImage = 'url(' + signInData.details.profileImageUrl + ')';
      el.classList.add('avatar');
      el.setAttribute('userId', signInData.userId);
      document.querySelector('#identity').appendChild(el);

      var el = document.createElement('button');
      el.innerHTML = signInData.userId;
      el.classList.add('id');
      el.classList.add('menu-attached');
      el.id = 'identity-menu-button';
      document.querySelector('#identity').appendChild(el);

      document.querySelector('#identity').classList.add('visible');

      _fetchAvatars();
    } else {
      var el = document.createElement('a');
      el.href = '/' + URL_SIGN_IN_REDIRECT;
      el.classList.add('command');
      el.innerHTML = 'Sign in';
      document.querySelector('#sign-in-link').appendChild(el);

      document.querySelector('#identity').classList.remove('visible');
    }
  }

  function _signInLoaded() {
    _loadSettings();

    _createSignInUI();

    if ((mode == MODE_CONTINUE) || (mode == MODE_JUST_SIGNED_IN) || 
        (mode == MODE_USER_GALLERY) || (mode == MODE_GLOBAL_GALLERY)) {
      if (settings.lastStreetId) {
        street.creatorId = settings.lastStreetCreatorId;
        street.id = settings.lastStreetId;
        street.namespacedId = settings.lastStreetNamespacedId;

        if ((mode == MODE_JUST_SIGNED_IN) && (!street.creatorId)) {
          promoteStreet = true;
        }
        
        if (mode == MODE_JUST_SIGNED_IN) {
          mode = MODE_CONTINUE;
        }
      } else {
        mode = MODE_NEW_STREET;
      }
    }

    switch (mode) {
      case MODE_NEW_STREET:
      case MODE_NEW_STREET_COPY_LAST:
        _createNewStreetOnServer();
        break;
      case MODE_EXISTING_STREET:
      case MODE_CONTINUE:
      case MODE_USER_GALLERY:
      case MODE_GLOBAL_GALLERY:
        _fetchStreetFromServer();
        break;
    }

    if (signedIn) {
      document.querySelector('#gallery-link a').href = '/' + signInData.userId;
    }

    signInLoaded = true;
    document.querySelector('#loading-progress').value++;
    _checkIfEverythingIsLoaded();
  }

  function _detectCountry() {
    countryLoaded = false;

    $.ajax({ url: IP_GEOCODING_API_URL }).done(_receiveCountry);

    window.setTimeout(_detectCountryTimeout, IP_GEOCODING_TIMEOUT);
  }

  function _detectCountryTimeout() {
    if (!countryLoaded) {
      countryLoaded = true;
      document.querySelector('#loading-progress').value++;      
      _checkIfEverythingIsLoaded();
    }
  }

  function _receiveCountry(info) {
    if (countryLoaded) {
      // Already loaded, discard results
      return;
    }

    if (info && info.country_code) {
      if (COUNTRIES_IMPERIAL_UNITS.indexOf(info.country_code) != -1) {
        units = SETTINGS_UNITS_IMPERIAL;
      } else {
        units = SETTINGS_UNITS_METRIC;
      }

      if (COUNTRIES_LEFT_HAND_TRAFFIC.indexOf(info.country_code) != -1) {
        leftHandTraffic = true;
      }
    }

    if (info && info.ip) {
      system.ipAddress = info.ip;
    }

    if (debug.forceLeftHandTraffic) {
      leftHandTraffic = true;
    }
    if (debug.forceMetric) {
      units = SETTINGS_UNITS_METRIC;
    }

    countryLoaded = true;
    document.querySelector('#loading-progress').value++;
    _checkIfEverythingIsLoaded();
  }

  function _onBodyLoad() {
    bodyLoaded = true;

    document.querySelector('#loading-progress').value++;
    _checkIfEverythingIsLoaded();
  }

  function _onReadyStateChange() {
    if (document.readyState == 'complete') {
      readyStateCompleteLoaded = true;

      document.querySelector('#loading-progress').value++;
      _checkIfEverythingIsLoaded();
    }
  }

  function _detectDebugUrl() {
    var url = location.href;

    // TODO const
    if (url.match(/[\?\&]debug-hover-polygon\&?/)) {
      debug.hoverPolygon = true;

      var el = document.createElement('div');
      el.id = 'debug-hover-polygon';
      document.body.appendChild(el);

      var canvasEl = document.createElement('canvas');
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
      el.appendChild(canvasEl);
    }

    if (url.match(/[\?\&]debug-force-left-hand-traffic\&?/)) {
      debug.forceLeftHandTraffic = true;
    }

    if (url.match(/[\?\&]debug-force-metric\&?/)) {
      debug.forceMetric = true;
    }

    if (url.match(/[\?\&]debug-force-unsupported-browser\&?/)) {
      debug.forceUnsupportedBrowser = true;
    }    
  }

  function _processUrl() {
    var url = location.pathname;

    // Remove heading slash
    if (!url) {
      url = '/';
    }
    url = url.substr(1);

    // Remove trailing slashes
    url = url.replace(/\/+$/, '');

    var urlParts = url.split(/\//);

    if (!url) {
      // Continue where we left off… or start with a default (demo) street

      mode = MODE_CONTINUE;
    } else if ((urlParts.length == 1) && (urlParts[0] == URL_NEW_STREET)) {
      // New street

      mode = MODE_NEW_STREET;
    } else if ((urlParts.length == 1) && (urlParts[0] == URL_NEW_STREET_COPY_LAST)) {
      // New street (but start with copying last street)

      mode = MODE_NEW_STREET_COPY_LAST;
    } else if ((urlParts.length == 1) && (urlParts[0] == URL_JUST_SIGNED_IN)) {
      // Coming back from a successful sign in

      mode = MODE_JUST_SIGNED_IN;
    } else if ((urlParts.length >= 1) && (urlParts[0] == URL_ERROR)) {
      // Error

      mode = MODE_ERROR;
      errorUrl = urlParts[1];
    } else if ((urlParts.length == 1) && (urlParts[0] == URL_GLOBAL_GALLERY)) {
      // Global gallery

      mode = MODE_GLOBAL_GALLERY;
    } else if ((urlParts.length == 1) && urlParts[0]) {
      // User gallery

      galleryUserId = urlParts[0];

      mode = MODE_USER_GALLERY;
    } else if ((urlParts.length == 2) && (urlParts[0] == URL_NO_USER) && urlParts[1]) {
      // TODO add is integer urlParts[1];
      // Existing street by an anonymous person

      street.creatorId = null;
      street.namespacedId = urlParts[1];

      mode = MODE_EXISTING_STREET;
    } else if ((urlParts.length >= 2) && urlParts[0] && urlParts[1]) {
      // TODO add is integer urlParts[1];
      // Existing street by a signed in person

      street.creatorId = urlParts[0];

      if (street.creatorId.charAt(0) == URL_RESERVED_PREFIX) {
        street.creatorId = street.creatorId.substr(1);
      }

      street.namespacedId = urlParts[1];

      mode = MODE_EXISTING_STREET;
    } else {
      mode = MODE_404;

      // 404: bad URL
    }
  }

  function _createNewStreetOnServer() {
    if (settings.newStreetPreference == NEW_STREET_EMPTY) {
      _prepareEmptyStreet();
    } else {
      _prepareDefaultStreet();
    }

    var transmission = _packServerStreetData();    

    jQuery.ajax({
      // TODO const
      url: API_URL + 'v1/streets',
      data: transmission,
      type: 'POST',
      dataType: 'json',
      headers: { 'Authorization': _getAuthHeader() }
    }).done(_receiveNewStreet)
    .fail(_errorReceiveNewStreet);
  }

  function _receiveNewStreet(data) {
    //console.log('received new street', data);

    _setStreetId(data.id, data.namespacedId);

    _saveStreetToServer(true);
  }

  function _errorReceiveNewStreet(data) {
    //console.log('failed new street!');

    _showError(ERROR_NEW_STREET_SERVER_FAILURE, true);
  }

  function _getFetchStreetUrl() {
    // TODO const
    if (street.creatorId) {
      var url = API_URL + 'v1/streets?namespacedId=' + 
          encodeURIComponent(street.namespacedId) + '&creatorId=' +
          encodeURIComponent(street.creatorId);
    } else {
      var url = API_URL + 'v1/streets?namespacedId=' + 
          encodeURIComponent(street.namespacedId);    
    }

    return url;    
  }

  function _fetchStreetFromServer() {
    var url = _getFetchStreetUrl();

    jQuery.ajax({
      url: url,
      dataType: 'json',
      type: 'GET',
    }).done(_receiveStreet).fail(_errorReceiveStreet);
  }

  function _updateAvatars() {
    var els = document.querySelectorAll('.avatar:not([loaded])');

    for (var i = 0, el; el = els[i]; i++) {
      var userId = el.getAttribute('userId');

      if (avatarCache[userId]) {
        el.style.backgroundImage = 'url(' + avatarCache[userId] + ')';
        el.setAttribute('loaded', true);
      }
    }
  }

  function _fetchAvatars() {
    var els = document.querySelectorAll('.avatar:not([loaded])');

    for (var i = 0, el; el = els[i]; i++) {
      var userId = el.getAttribute('userId');

      if (userId && (typeof avatarCache[userId] == 'undefined')) {
        _fetchAvatar(userId);
      }
    }

    _updateAvatars();
  }

  function _fetchAvatar(userId) {
    avatarCache[userId] = null;
  
    jQuery.ajax({
      dataType: 'json',
      url: API_URL + 'v1/users/' + userId
    }).done(_receiveAvatar);
  }

  function _receiveAvatar(details) {
    if (details && details.id && details.profileImageUrl) {
      avatarCache[details.id] = details.profileImageUrl;
      _updateAvatars();
    }
  }

  function _errorReceiveStreet(data) {
    if ((mode == MODE_CONTINUE) || (mode == MODE_USER_GALLERY) || 
        (mode == MODE_GLOBAL_GALLERY)) {
      _goNewStreet();
    } else {
      if ((data.status == 404) || (data.status == 410)) {
        // TODO swap for showError (here and elsewhere)
        mode = MODE_404;
        _processMode();
      } else {
        _showError(ERROR_NEW_STREET_SERVER_FAILURE, true);
      }
    }
  }

  function _goReloadClearSignIn() {
    signInData = null;
    _saveSignInDataLocally();
    _removeSignInCookies();

    location.reload();
  }

  function _goReload() {
    location.reload();
  }

  function _goHome() {
    location.href = '/';
  }

  function _goSignIn() {
    location.href = '/' + URL_SIGN_IN_REDIRECT;
  }

  function _goNewStreet() {
    location.href = '/' + URL_NEW_STREET;
  }

  function _goCopyLastStreet() {
    location.href = '/' + URL_NEW_STREET_COPY_LAST;
  }

  function _showError(errorType, newAbortEverything) {
    var title = '';
    var description = '';

    _hideLoadingScreen();

    abortEverything = newAbortEverything;

    switch (errorType) {
      case ERROR_404:
        title = 'Page not found.';
        description = 'Oh, boy. There is no page with this address!<br><button class="home">Go to the homepage</button>';
        // TODO go to homepage
        break;
      case ERROR_SIGN_OUT:
        title = 'You are now signed out.';
        description = '<button class="sign-in">Sign in again</button> <button class="home">Go to the homepage</button>';
        break;
      case ERROR_NO_STREET:
        title = 'No street selected.';
        break;
      case ERROR_FORCE_RELOAD_SIGN_OUT:
        title = 'You signed out in another window.';
        description = 'Please reload this page before continuing.<br><button class="reload">Reload the page</button>';
        break;
      case ERROR_FORCE_RELOAD_SIGN_OUT_401:
        title = 'You signed out in another window.';
        description = 'Please reload this page before continuing.<br>(Error 401)<br><button class="clear-sign-in-reload">Reload the page</button>';
        break;
      case ERROR_FORCE_RELOAD_SIGN_IN:
        title = 'You signed in in another window.';
        description = 'Please reload this page before continuing.<br><button class="reload">Reload the page</button>';
        break;
      case ERROR_STREET_DELETED_ELSEWHERE:
        title = 'This street has been deleted elsewhere.';
        description = 'This street has been deleted in another browser.<br><button class="home">Go to the homepage</button>';
        break;
      case ERROR_NEW_STREET_SERVER_FAILURE:
        title = 'Having trouble…';
        description = 'We’re having trouble loading Streetmix.<br><button class="new">Try again</button>';
        break;
      case ERROR_TWITTER_ACCESS_DENIED:
        title = 'You are not signed in.';
        description = 'You cancelled the Twitter sign in process.<br><button class="home">Go to the homepage</button>';
        break;
      case ERROR_AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN:
      case ERROR_AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN:
      case ERROR_AUTH_PROBLEM_API_PROBLEM:
        title = 'There was a problem with signing you in.';
        // TODO const for feedback
        description = 'There was a problem with Twitter authentication. Please try again later or let us know via <a target="_blank" href="mailto:streetmix@codeforamerica.org">email</a> or <a target="_blank" href="https://twitter.com/intent/tweet?text=@streetmixapp">Twitter</a>.<br><button class="home">Go to the homepage</button>';
        break;
      case ERROR_GENERIC_ERROR:
        title = 'Something went wrong.';
        // TODO const for feedback
        description = 'We’re sorry – something went wrong. Please try again later or let us know via <a target="_blank" href="mailto:streetmix@codeforamerica.org">email</a> or <a target="_blank" href="https://twitter.com/intent/tweet?text=@streetmixapp">Twitter</a>.<br><button class="home">Go to the homepage</button>';
        break;
      case ERROR_UNSUPPORTED_BROWSER:
        title = 'Streetmix doesn’t work on your browser… yet.';
        // TODO const for feedback
        description = 'Sorry about that. You might want to try <a target="_blank" href="http://www.google.com/chrome">Chrome</a>, <a target="_blank" href="http://www.mozilla.org/firefox">Firefox</a>, or Safari. If you think your browser should be supported, let us know via <a target="_blank" href="mailto:streetmix@codeforamerica.org">email</a> or <a target="_blank" href="https://twitter.com/intent/tweet?text=@streetmixapp">Twitter</a>.';
        break;        
    }

    document.querySelector('#error h1').innerHTML = title;
    document.querySelector('#error .description').innerHTML = description;

    var el = document.querySelector('#error .home');
    if (el) {
      el.addEventListener('click', _goHome);
    }

    var el = document.querySelector('#error .sign-in');
    if (el) {
      el.addEventListener('click', _goSignIn);
    }

    var el = document.querySelector('#error .reload');
    if (el) {
      el.addEventListener('click', _goReload);
    }

    var el = document.querySelector('#error .clear-sign-in-reload');
    if (el) {
      el.addEventListener('click', _goReloadClearSignIn);
    }

    var el = document.querySelector('#error .new');
    if (el) {
      el.addEventListener('click', _goNewStreet);
    }

    document.querySelector('#error').classList.add('visible');

    currentErrorType = errorType;
  }

  function _hideError() {
    document.querySelector('#error').classList.remove('visible');    

    currentErrorType = null;
  }

  function _showErrorFromUrl() {
    // TODO const
    switch (errorUrl) {
      case 'twitter-access-denied':
        var errorType = ERROR_TWITTER_ACCESS_DENIED;
        break;
      case 'no-twitter-request-token':
        var errorType = ERROR_AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN;
        break;
      case 'no-twitter-access-token':
        var errorType = ERROR_AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN;
        break;
      case 'authentication-api-problem':
        var errorType = ERROR_AUTH_PROBLEM_API_PROBLEM;
        break;
      default:
        var errorType = ERROR_GENERIC_ERROR;
        break;
    }

    _showError(errorType, true);
  }  

  function _processMode() {
    serverContacted = true;

    switch (mode) {
      case MODE_ERROR:
        _showErrorFromUrl();
        break;
      case MODE_UNSUPPORTED_BROWSER:
        _showError(ERROR_UNSUPPORTED_BROWSER, true);
        break;
      case MODE_404:
        _showError(ERROR_404, true);
        break;
      case MODE_SIGN_OUT:
        _showError(ERROR_SIGN_OUT, true);
        break;
      case MODE_FORCE_RELOAD_SIGN_OUT:
        _showError(ERROR_FORCE_RELOAD_SIGN_OUT, true);
        break;
      case MODE_FORCE_RELOAD_SIGN_OUT_401:
        _showError(ERROR_FORCE_RELOAD_SIGN_OUT_401, true);
        break;
      case MODE_FORCE_RELOAD_SIGN_IN:
        _showError(ERROR_FORCE_RELOAD_SIGN_IN, true);
        break;
      case MODE_NEW_STREET:
        serverContacted = false;
        break;
      case MODE_NEW_STREET_COPY_LAST:
        serverContacted = false;
        break;
      case MODE_CONTINUE:
      case MODE_USER_GALLERY:
      case MODE_GLOBAL_GALLERY:
        serverContacted = false;
        break;
      case MODE_JUST_SIGNED_IN:
        serverContacted = false;
        break;
      case MODE_EXISTING_STREET:
        serverContacted = false;
        break;
    }
  }

  function _fillEmptySegment(el) {
    var innerEl = document.createElement('span');
    innerEl.classList.add('name');
    innerEl.innerHTML = msg('SEGMENT_NAME_EMPTY');
    el.appendChild(innerEl);

    var innerEl = document.createElement('span');
    innerEl.classList.add('width');
    el.appendChild(innerEl);

    var innerEl = document.createElement('span');
    innerEl.classList.add('grid');
    el.appendChild(innerEl);  
  }

  function _fillEmptySegments() {
    _fillEmptySegment(document.querySelector('#street-section-left-empty-space'));
    _fillEmptySegment(document.querySelector('#street-section-right-empty-space'));
  }

  function _fillDom() {
    // TODO Instead of doing like this, put variables in the index.html, and fill
    // them out?
    $('#undo').text(msg('BUTTON_UNDO'));
    $('#redo').text(msg('BUTTON_REDO'));

    $('#trashcan').text(msg('UI_DRAG_HERE_TO_REMOVE'));

    _fillEmptySegments();
  }
 
  main.init = function() {
    initializing = true;
    ignoreStreetChanges = true;

    _fillDom();
    _prepareSegmentInfo();

    // Temporary as per https://github.com/Modernizr/Modernizr/issues/788#issuecomment-12513563
    Modernizr.addTest('pagevisibility', !!Modernizr.prefixed('hidden', document, false));

    // TODO make it better 
    // Related to Enter to 404 bug in Chrome
    $.ajaxSetup({ cache: false });

    readyStateCompleteLoaded = false;
    document.addEventListener('readystatechange', _onReadyStateChange);

    bodyLoaded = false;
    window.addEventListener('load', _onBodyLoad);

    _detectDebugUrl();
    _detectSystemCapabilities();

    _processUrl();
    _processMode();

    if (abortEverything) {
      return;
    }

    // Asynchronously loading…

    // …detecting country from IP for units and left/right-hand driving
    if ((mode == MODE_NEW_STREET) || (mode == MODE_NEW_STREET_COPY_LAST)) {
      _detectCountry();
    } else {
      countryLoaded = true;
    }

    // …sign in info from our API (if not previously cached) – and subsequent
    // street data if necessary (depending on the mode)
    _loadSignIn();

    // …images
    _loadImages();

    // Note that we are waiting for sign in and image info to show the page,
    // but we give up on country info if it’s more than 1000ms.
  }

  return main;
})();
