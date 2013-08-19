/*
 * Streetmix
 *
 * Front-end (mostly) by Marcin Wichary, Code for America fellow in 2013.
 *
 * Note (July 2013): This code is still wonky. Now that we’re out of alpha, I will be
 * dedicating some effort to cleaning it up.
 */

var main = (function(){
"use strict";
  var main = {};

  // TODO reorder/clean up constants

  var MESSAGES = {
    BUTTON_UNDO: 'Undo',
    BUTTON_REDO: 'Redo',

    BUTTON_NEW_STREET: 'Create new street',
    BUTTON_COPY_LAST_STREET: 'Make a copy',    

    DRAG_HERE_TO_REMOVE: 'Drag here to remove',

    UI_GLYPH_X: '×',

    PROMPT_NEW_STREET_NAME: 'New street name:',
    PROMPT_DELETE_STREET: 'Are you sure you want to permanently delete [[name]]? This cannot be undone.',
    PROMPT_NEW_STREET_WIDTH: 'New street width (from [[minWidth]] to [[maxWidth]]):',

    MENU_SWITCH_TO_IMPERIAL: 'Switch to imperial units (feet)',
    MENU_SWITCH_TO_METRIC: 'Switch to metric units',

    TOOLTIP_REMOVE_SEGMENT: 'Remove segment',
    TOOLTIP_DELETE_STREET: 'Delete street',
    TOOLTIP_SEGMENT_WIDTH: 'Change width of the segment',
    TOOLTIP_BUILDING_HEIGHT: 'Change the number of floors',
    TOOLTIP_STREET_WIDTH: 'Change width of the street',
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
    LOADING: 'Loading…',

    USER_ANONYMOUS: 'Anonymous',

    STREET_COUNT_0: 'No streets yet',
    STREET_COUNT_1: '1 street',
    STREET_COUNT_MANY: '[[streetCount]] streets',

    DEFAULT_STREET_NAME: 'Unnamed St',

    SEGMENT_NAME_EMPTY: 'Empty space'
  };

  var FLAG_SAVE_UNDO = false; // true to save undo with street data, false to not save undo

  var SITE_URL = 'http://{{app_host_port}}/';
  var API_URL = '{{{restapi_proxy_baseuri_rel}}}/';

  var IP_GEOLOCATION_API_URL = 'http://freegeoip.net/json/';
  var IP_GEOLOCATION_TIMEOUT = 1000; // After this time, we don’t wait any more

  var FACEBOOK_APP_ID = '{{facebook_app_id}}';
  var GOOGLE_ANALYTICS_ACCOUNT = '{{google_analytics_account}}';

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

  var URL_JUST_SIGNED_IN = 'just-signed-in'; // TODO fix this
  var URL_NEW_STREET = 'new';
  var URL_NEW_STREET_COPY_LAST = 'copy-last';
  var URL_GLOBAL_GALLERY = 'gallery';
  var URL_ERROR = 'error';
  var URL_NO_USER = '-';
  var URL_HELP = 'help';
  var URL_ABOUT = 'about';
  var URL_HELP_ABOUT = '/' + URL_HELP + '/' + URL_ABOUT;

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
    '/images/tiles-1.png',
    '/images/tiles-2.png',
    '/images/tiles-3.png',
    '/images/sky-front.png',
    '/images/sky-rear.png',
    '/images/share-icons/facebook-29.png',
    '/images/share-icons/twitter-32.png'
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
      descriptionPrompt: 'Learn more about wayfinding signs',
      description: '<img src="/images/info-bubble-examples/wayfinding-02.jpg"><p class="lede">Wayfinding signs help pedestrians get to common destinations.</p><p>Urban planners and architects have spent a few decades trying to learn what happens in people’s brains when they figure out how to get from point A to point B – or how they even know where “point A” is to begin with. As early as 1960, urban planner Kevin Lynch wrote of the “legibility” of the city in his book <em><a href="http://www.amazon.com/Image-Harvard-MIT-Center-Studies-Series/dp/0262620014">The Image of the City</a></em>, describing wayfinding as “a consistent use and organization of definite sensory cues from the external environment.” It could be intangible – smell, touch, a sense of gravity or even electric or magnetic fields. Or it could be much more physical, with intentionally designed “wayfinding devices” like maps, street numbers, or route signs.</p><p>It’s surprising how readily acceptable it is for ample signage to cater to car travel, with less of this investment made at the pedestrian level. Maybe it’s because it’s easier for us to stand still, take stock of our surroundings, and use our senses without fear of accidentally causing a six-person pileup behind us. At any rate, urban designers have pushed for pedestrian-friendly wayfinding signage, particularly in walkable commercial neighborhoods, and these signs have become branding opportunities in addition to being functional. So New York City <a href="http://new.pentagram.com/2013/06/new-work-nyc-wayfinding/">hired an internationally renowned design consultant</a> (and Streetmix has modeled its segments after it), many others have adopted a traditional old-town or civic-formal take (pictured above), and then there are those, for whatever reason, who lack any pedestrian wayfinding signage of significance, such that any improvement must be made with <a href="http://walkyourcity.org/">guerrilla wayfinding tactics</a>.</p><p>After all, there’s nothing worse than being lost. As Lynch wrote: “The very word <em>lost</em> in our language means much more than simple geographical uncertainty; it carries overtones of utter disaster.” And who wants to be on the street feeling like that?</p>',
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
      descriptionPrompt: 'Learn more about parklets',
      description: '<img src="/images/info-bubble-examples/parklets-01.jpg"><p class="lede">Parklets turn existing parking spots into temporary public spaces.</p><p>In 2005, San Francisco-based design studio <a href="http://rebargroup.org/">Rebar</a> temporarily converted a single metered parking space on downtown Mission Street into a tiny public park. The first parklet was simple: just a bench and a tree on a rectangular piece of turf, but it featured a brief instruction manual and a charge for others to make their own. With people realizing that so much of public space was really devoted to storing cars, an international movement was born, and now, the annual <a href="http://parkingday.org/">Park(ing) Day</a> hosts nearly a thousand temporarily converted spots around the world.</p><p>Knowing a good idea when it sees one, San Francisco became the first city to make parklets official with its <a href="http://sfpavementtoparks.sfplanning.org/">Pavement to Parks program</a> in 2010. Today, the City by the Bay has over 50 parklets, many of which are now architecturally designed objects much improved beyond Rebar’s modest prototype. There’s an ambitious, corporate-sponsored two-block-long parklet in the heart of San Francisco’s busiest shopping corridor, and also a collection of movable, bright red “parkmobiles” (Streetmix’s default look) designed for the <a href="http://www.ybcbd.org/">Yerba Buena Community Benefit District</a>. Official parklet programs now exist in many other cities in North America, such as Philadelphia, Oakland, Kansas City, New York, Chicago, and Vancouver, and many more cities are soon to follow.</p><footer>Photo: 4033 Judah Street Parklet, courtesy of San Francisco Planning Department.</footer>',
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
      descriptionPrompt: 'Learn more about bike lanes',
      description: '<img src="/images/info-bubble-examples/bike-lane-02.jpg"><p class="lede">Bike lanes help keep bicyclists safe in a separate lane from cars.</p><p>On the historical timeline of personal transportation vehicles – horses on one end, and, say, Segways on the other – automobiles and bicycles have been the dominant warring tribes of public streets for nearly a century. Despite all the cars taking up so much room, though, there’s more bicycles than anything else in the world: more than a billion, as estimated by Worldometers, and nine million in Beijing, according to folk singer <a href="http://en.wikipedia.org/wiki/Nine_Million_Bicycles">Katie Melua</a>, where bicycling accounts for 32% of all trips.</p><p>While most jurisdictions allow bicycles to share the road with motor vehicles (“A person riding a bicycle… has all the rights and is subject to all the provisions applicable to the driver of a vehicle” <a href="http://www.leginfo.ca.gov/cgi-bin/displaycode?section=veh&group=21001-22000&file=21200-21212">says the California Vehicle Code</a>, in one particular instance) it goes without saying that most cyclists prefer to be in their own lane. It’s safer, for one thing. And because it’s safer, it actually encourages more bikers. And more bikers means healthier citizens, reduced carbon emissions, higher traffic throughput, and congestion mitigation. The <a href="http://pdxcityclub.org/2013/Report/Portland-Bicycle-Transit/Economic-Effects-of-Increased-Bicycle-Usage">economic benefits accrue as well</a>: less money spent on automobile infrastructure (like bridges, roadways, and parking), and with the ability to fit more people on a road, it leads to more business in commercial corridors.<p>Bike lane design can be extremely varied. Using medians, planters, bollards, or even parking lanes create better protection between bikes and cars. When lanes are painted green, it shows their city’s commitment to a continuous bike lane, and synchronized signal light timing to limit bike stops are called a “green wave.” For more information, check out the <a href="http://nacto.org/cities-for-cycling/design-guide/">NACTO Urban Bikeway Design Guide</a>.</p>',
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
          descriptionPrompt: 'Learn more about sharrows',
          description: '<img src="/images/info-bubble-examples/sharrow-01.jpg"><p class="lede">Sharrows are marked travel lanes shared by both cars and bikes.</p><p>Officially known in transportation planning as “shared lane marking,” sharrows (a portmanteau of “shared” and “arrow”) refer to the arrow markings themselves, but aren’t actually a different <em>type</em> of lane. In many places, bicycles are already allowed on any street meant for cars, and are bound by the same laws.</p><p>That being said, it doesn’t take a rocket scientist to see that cars and bikes behave very differently, and so separate bike lanes are <a href="http://dc.streetsblog.org/2013/06/13/in-california-cities-drivers-want-more-bike-lanes-heres-why/">much more preferable</a> for both the safety of cyclists and the sanity of car drivers. But for many cyclists, when there’s not enough road space for those bike lanes, the argument is that sharrows are better than nothing else at all. Motorists tend to forget there are other types of vehicles, and cyclists appreciate any opportunity to remind motorists that they exist and must coexist peacefully together. And giving cyclists more leeway to use the full width of a lane can also protect them from parked cars, in a particular type of accident cyclists call “getting doored.”</p><p>Sharrow markings are a simple way to provide more visibility to bicyclists, since paint is cheaper than building a dedicated bike lane, and more politically feasible. However, some research on safety (such as a <a href="http://injuryprevention.bmj.com/content/early/2013/02/13/injuryprev-2012-040561.full.pdf">2012 BMJ study</a> of bicycle injuries in Vancouver and Toronto) indicate that there were slightly increased odds of injury in a shared lane, compared to those in a dedicated bike lane. The moral of the story is, take care of bicyclists by trying to put in a normal bike lane first before resorting to sharrows.</p><footer></footer>',
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
          descriptionPrompt: 'Learn more about sharrows',
          description: '<img src="/images/info-bubble-examples/sharrow-01.jpg"><p class="lede">Sharrows are marked travel lanes shared by both cars and bikes.</p><p>Officially known in transportation planning as “shared lane marking,” sharrows (a portmanteau of “shared” and “arrow”) refer to the arrow markings themselves, but aren’t actually a different <em>type</em> of lane. In many places, bicycles are already allowed on any street meant for cars, and are bound by the same laws.</p><p>That being said, it doesn’t take a rocket scientist to see that cars and bikes behave very differently, and so separate bike lanes are <a href="http://dc.streetsblog.org/2013/06/13/in-california-cities-drivers-want-more-bike-lanes-heres-why/">much more preferable</a> for both the safety of cyclists and the sanity of car drivers. But for many cyclists, when there’s not enough road space for those bike lanes, the argument is that sharrows are better than nothing else at all. Motorists tend to forget there are other types of vehicles, and cyclists appreciate any opportunity to remind motorists that they exist and must coexist peacefully together. And giving cyclists more leeway to use the full width of a lane can also protect them from parked cars, in a particular type of accident cyclists call “getting doored.”</p><p>Sharrow markings are a simple way to provide more visibility to bicyclists, since paint is cheaper than building a dedicated bike lane, and more politically feasible. However, some research on safety (such as a <a href="http://injuryprevention.bmj.com/content/early/2013/02/13/injuryprev-2012-040561.full.pdf">2012 BMJ study</a> of bicycle injuries in Vancouver and Toronto) indicate that there were slightly increased odds of injury in a shared lane, compared to those in a dedicated bike lane. The moral of the story is, take care of bicyclists by trying to put in a normal bike lane first before resorting to sharrows.</p><footer></footer>',
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
          minWidth: 9,
          maxWidth: 12,
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
      defaultWidth: 10,
      variants: ['direction', 'public-transit-asphalt'],
      details: {
        'inbound|regular': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 1, x: 28, y: 27, width: 11, height: 13 }, // Bus
              { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (inbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
          }
        },
        'outbound|regular': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 1, x: 16, y: 27, width: 12, height: 13 }, // Bus
              { tileset: 1, x: 39, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (outbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53, width: 10, height: 5, offsetY: 10 } // Asphalt
          }
        },
        'inbound|colored': {
          minWidth: 9,
          maxWidth: 12,
          graphics: {
            center: [
              { tileset: 1, x: 28, y: 27, width: 11, height: 13 }, // Bus
              { tileset: 1, x: 30, y: 15, width: 4, height: 5, offsetY: 10 } // Arrow (inbound)
            ],
            repeat: { tileset: 2, x: 98, y: 53 + 10, width: 10, height: 5, offsetY: 10 } // Red asphalt
          }
        },
        'outbound|colored': {
          minWidth: 9,
          maxWidth: 12,
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
      defaultWidth: 10,
      variants: ['direction', 'public-transit-asphalt'],
      details: {
        'inbound|regular': {
          minWidth: 9,
          maxWidth: 12,
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
          minWidth: 9,
          maxWidth: 12,
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
          minWidth: 9,
          maxWidth: 12,
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
          minWidth: 9,
          maxWidth: 12,
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
              { tileset: 1, x: 28, y: 15, width: 8, height: 5, offsetY: 10 } // Dark arrow (inbound)
            ],
            repeat: { tileset: 2, x: 110, y: 43, width: 9, height: 5, offsetY: 10 } // Lower concrete
          }          
        },
        'outbound|regular': {
          minWidth: 9,
          maxWidth: 12,
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
          minWidth: 9,
          maxWidth: 12,
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
          minWidth: 9,
          maxWidth: 12,
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
          minWidth: 9,
          graphics: {
            left: { tileset: 3, x: 171, y: 51, width: 9, height: 12, offsetY: -3 },
            repeat: { tileset: 2, x: 110, y: 63, width: 9, height: 9, offsetY: 6 } // Raised concrete
          }          
        },
        'right|light-rail': {
          minWidth: 9,
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
      descriptionPrompt: 'Learn more',
      description: '<img src="/images/info-bubble-examples/train.jpg"><p>It’s the train from the Christopher Nolan movie <em>Inception.</em> What more do you need to know?</p>',
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

  var lastStreet;
  
  var undoStack = [];
  var undoPosition = 0;
  var ignoreStreetChanges = false;  

  var settings = {
    lastStreetId: null,
    lastStreetNamespacedId: null,
    lastStreetUserId: null,
    priorLastStreetId: null, // Do not save
    newStreetPreference: null,

    saveAsImageTransparentSky: null,
    saveAsImageSegmentNamesAndWidths: null,
    saveAsImageStreetName: null
  };
  var settingsWelcomeDismissed = false;

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

  var readOnly = false;

  var draggingType = DRAGGING_TYPE_NONE;

  var draggingResize = {
    segmentEl: null,
    floatingEl: null,
    mouseX: null,
    mouseY: null,
    elX: null,
    elY: null,
    width: null,
    originalX: null,
    originalWidth: null,
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
    originalRandSeed: null,
    floatingElVisible: false
  };

  var initializing = false;

  var widthHeightEditHeld = false;
  var widthHeightChangeTimerId = -1;

  var galleryVisible = false;

  var streetSectionCanvasLeft;

  var images;
  var imagesToBeLoaded;

  var bodyLoaded;
  var readyStateCompleteLoaded;  
  var geolocationLoaded;
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

  var printingNeedsUpdating = true;

  var system = {
    touch: false,
    phone: false,
    safari: false,
    windows: false,

    viewportWidth: null,
    viewportHeight: null,

    hiDpi: 1.0,
    cssTransform: false,

    ipAddress: null,

    apiUrl: null
  };

  var debug = {
    hoverPolygon: false,
    canvasRectangles: false,
    forceLeftHandTraffic: false,
    forceMetric: false,
    forceUnsupportedBrowser: false,
    forceNonRetina: false,
    secretSegments: false
  };

  var streetSectionTop;

  var segmentWidthResolution;
  var segmentWidthClickIncrement;
  var segmentWidthDraggingResolution;

  var galleryUserId = null;
  var galleryStreetId = null;
  var galleryStreetLoaded = false;

  var nonblockingAjaxRequests = [];

  var nonblockingAjaxRequestTimer = 0;

  var NON_BLOCKING_AJAX_REQUEST_TIME = [10, 500, 1000, 5000, 10000];
  var NON_BLOCKING_AJAX_REQUEST_BACKOFF_RANGE = 60000;

  var NON_BLOCKING_NO_CONNECTION_MESSAGE_TIMER_COUNT = 4;

  var blockingAjaxRequest;
  var blockingAjaxRequestDoneFunc;
  var blockingAjaxRequestCancelFunc;
  var blockingAjaxRequestInProgress = false;

  var blockingShieldTimerId = -1;
  var blockingShieldTooSlowTimerId = -1;

  var menuVisible = false;

  var widthChartShowTimerId = -1;
  var widthChartHideTimerId = -1;

  var latestRequestId;
  var latestVerificationStreet;  

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
    if ($.isArray(obj)) {
      return $.extend(true, [], obj);
    } else {  
      return $.extend(true, {}, obj);
    }
  }

  // -------------------------------------------------------------------------

  function _drawSegmentImage(tileset, ctx, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (!sw || !sh || !dw || !dh) {
      return;
    }

    if ((imagesToBeLoaded == 0) && (sw > 0) && (sh > 0) && (dw > 0) && (dh > 0)) {     
      sx += TILESET_CORRECTION[tileset] * 12;

      dx *= system.hiDpi;
      dy *= system.hiDpi;
      dw *= system.hiDpi;
      dh *= system.hiDpi;

      if (sx < 0) {
        dw += sx;
        sx = 0;
      }

      if (debug.canvasRectangles) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(dx, dy, dw, dh);
      }

      ctx.drawImage(images['/images/tiles-' + tileset + '.png'],
          sx * TILESET_POINT_PER_PIXEL, sy * TILESET_POINT_PER_PIXEL, 
          sw * TILESET_POINT_PER_PIXEL, sh * TILESET_POINT_PER_PIXEL,
          dx, dy, dw, dh);
    }
  }

  function _drawProgrammaticPeople(ctx, width, offsetLeft, offsetTop, randSeed, multiplier, variantString) {
    var people = [];
    var peopleWidth = 0;

    var variantArray = _getVariantArray('sidewalk', variantString);

    switch (variantArray['sidewalk-density']) {
      case 'empty':
        return;
      // TODO const
      case 'sparse':
        var widthConst = 60;
        var widthRand = 100;
        break;
      case 'normal':
        var widthConst = 18;
        var widthRand = 60;
        break;
      case 'dense':
        var widthConst = 18;
        var widthRand = 18;
        break;
    }

    var randSeed = (randSeed || 35) + 16;

    var randomGenerator = new RandomGenerator();
    randomGenerator.seed(randSeed);

    var lastPersonType = 0;

    var peopleCount = 0;

    while ((!peopleCount) || (peopleWidth < width - 40)) {
      var person = {};
      person.left = peopleWidth;
      do {
        person.type = Math.floor(randomGenerator.rand() * PERSON_TYPES);
      } while ((person.type == lastPersonType) || ((peopleCount == 0) && !PERSON_CAN_GO_FIRST[person.type]));
      lastPersonType = person.type;

      var lastWidth = widthConst + PERSON_WIDTH[person.type] * 12 - 24 + randomGenerator.rand() * widthRand;

      peopleWidth += lastWidth;
      people.push(person);
      peopleCount++;
    }
    peopleWidth -= lastWidth;

    var startLeft = (width - peopleWidth) / 2;

    var firstPersonCorrection = (4 - PERSON_WIDTH[people[0].type]) * 12 / 2;
    if (people.length == 1) {
      startLeft += firstPersonCorrection;
    } else {
      var lastPersonCorrection = (4 - PERSON_WIDTH[people[people.length - 1].type]) * 12 / 2;

      startLeft += (firstPersonCorrection + lastPersonCorrection) / 2;
    }

    for (var i in people) {
      var person = people[i];
      // TODO const

      var typeX = person.type % PERSON_TILESET_WRAP;
      var typeY = Math.floor(person.type / PERSON_TILESET_WRAP);

      _drawSegmentImage(2, ctx, 
          1008 + 12 * 5 * typeX, 1756 / 2 + 24 * 4 * typeY, 
          12 * 5, 24 * 4, 
          offsetLeft + (person.left - 5 * 12 / 2 - (4 - PERSON_WIDTH[person.type]) * 12 / 2 + startLeft) * multiplier, 
          offsetTop + 37 * multiplier, 
          12 * 5 * multiplier, 24 * 4 * multiplier);
    }
  }

  function _getVariantInfoDimensions(variantInfo, initialSegmentWidth, multiplier) {
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

  function _drawSegmentContents(ctx, type, variantString, segmentWidth, offsetLeft, offsetTop, randSeed, multiplier, palette) {
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
      _drawProgrammaticPeople(ctx, segmentWidth / multiplier, offsetLeft - left * TILE_SIZE * multiplier, offsetTop, randSeed, multiplier, variantString);
    }
  }

  function _setSegmentContents(el, type, variantString, segmentWidth, randSeed, palette, quickUpdate) {
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

    _drawSegmentContents(ctx, type, variantString, segmentWidth, 0, offsetTop, randSeed, multiplier, palette);

    if (!quickUpdate) {
      _removeElFromDom(el.querySelector('canvas'));
      el.appendChild(canvasEl);

      _removeElFromDom(el.querySelector('.hover-bk'));
      el.appendChild(hoverBkEl);
    }
  }


  function _onWidthHeightEditClick(event) {
    var el = event.target;

    el.hold = true;
    widthHeightEditHeld = true;

    if (document.activeElement != el) {
      el.select();
    }
  }

  function _onWidthHeightEditMouseOver(event) {
    if (!widthHeightEditHeld) {
      event.target.focus();
      event.target.select();
    }
  }

  function _onWidthHeightEditMouseOut(event) {
    var el = event.target;
    if (!widthHeightEditHeld) {
      _loseAnyFocus();
    }
  }

  function _loseAnyFocus() {
    document.body.focus();
  }

  function _isFocusOnBody() {
    return document.activeElement == document.body;
  }

  function _onWidthEditFocus(event) {
    var el = event.target;

    el.oldValue = el.realValue;
    el.value = _prettifyWidth(el.realValue, PRETTIFY_WIDTH_INPUT);
  }

  function _onHeightEditFocus(event) {
    var el = event.target;

    el.oldValue = el.realValue;
    el.value = _prettifyHeight(el.realValue, PRETTIFY_WIDTH_INPUT);
  }

  function _onWidthEditBlur(event) {
    var el = event.target;

    _widthEditInputChanged(el, true);

    el.realValue = parseFloat(el.segmentEl.getAttribute('width'));
    el.value = _prettifyWidth(el.realValue, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);

    el.hold = false;
    widthHeightEditHeld = false;
  }

  function _onHeightEditBlur(event) {
    var el = event.target;

    _heightEditInputChanged(el, true);

    el.realValue = (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) ? street.leftBuildingHeight : street.rightBuildingHeight;
    el.value = _prettifyHeight(el.realValue, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);

    el.hold = false;
    widthHeightEditHeld = false;
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

  function _heightEditInputChanged(el, immediate) {
    window.clearTimeout(widthHeightChangeTimerId);

    var height = parseInt(el.value);

    if (!height || (height < 1)) {
      height = 1;
    } else if (height > MAX_BUILDING_HEIGHT) {
      height = MAX_BUILDING_HEIGHT;
    }

    if (immediate) {
      if (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) {
        street.leftBuildingHeight = height;
      } else {
        street.rightBuildingHeight = height;
      }
      _buildingHeightUpdated();
    } else {
      widthHeightChangeTimerId = window.setTimeout(function() {
        if (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) {
          street.leftBuildingHeight = height;
        } else {
          street.rightBuildingHeight = height;
        }
        _buildingHeightUpdated();
      }, WIDTH_EDIT_INPUT_DELAY);
    }
  }

  function _widthEditInputChanged(el, immediate) {
    window.clearTimeout(widthHeightChangeTimerId);

    var width = _processWidthInput(el.value);

    if (width) {
      var segmentEl = el.segmentEl;

      if (immediate) {
        _resizeSegment(segmentEl, RESIZE_TYPE_TYPING, 
            width * TILE_SIZE, false, false);
        _infoBubble.updateWidthButtonsInContents(width);
      } else {
        widthHeightChangeTimerId = window.setTimeout(function() {
          _resizeSegment(segmentEl, RESIZE_TYPE_TYPING,
          width * TILE_SIZE, false, false);
        _infoBubble.updateWidthButtonsInContents(width);
        }, WIDTH_EDIT_INPUT_DELAY);
      }
    }
  }

  function _onWidthEditInput(event) {
    _widthEditInputChanged(event.target, false);

    _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_CHANGE_WIDTH, 
        TRACK_LABEL_INPUT_FIELD, null, true);
  }

  function _onHeightEditInput(event) {
    _heightEditInputChanged(event.target, false);
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

  function _onHeightEditKeyDown(event) {
    var el = event.target;

    switch (event.keyCode) {
      case KEY_ENTER:
        _heightEditInputChanged(el, true);
        _loseAnyFocus();
        el.value = _prettifyHeight((_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) ? street.leftBuildingHeight : street.rightBuildingHeight, PRETTIFY_WIDTH_INPUT);
        el.focus();
        el.select();
        break;
      case KEY_ESC:
        el.value = el.oldValue;
        _heightEditInputChanged(el, true);
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
    width = Math.round(width / resolution) * resolution;

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

  function _prettifyHeight(height, purpose) {
    var heightText = height;

    switch (purpose) {
      case PRETTIFY_WIDTH_INPUT:
        break;
      case PRETTIFY_WIDTH_OUTPUT_MARKUP:
      case PRETTIFY_WIDTH_OUTPUT_NO_MARKUP:
        heightText += ' floor';
        if (height > 1) {
          heightText += 's';          
        }

        var attr = _getBuildingAttributes(street, _infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING);

        heightText += ' (' + _prettifyWidth(attr.realHeight / TILE_SIZE, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP) + ')';

        break;
    }
    return heightText;
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
        if (!widthText) {
          widthText = '0';
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
        width * TILE_SIZE, true, false);
  }

  function _onWidthDecrementClick(event) {
    var el = event.target;
    var segmentEl = el.segmentEl;
    var precise = event.shiftKey;
    
    _incrementSegmentWidth(segmentEl, false, precise);
    _scheduleControlsFadeout(segmentEl);

    _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_CHANGE_WIDTH, 
        TRACK_LABEL_INCREMENT_BUTTON, null, true);
  }

  function _onWidthIncrementClick(event) {
    var el = event.target;
    var segmentEl = el.segmentEl;
    var precise = event.shiftKey;

    _incrementSegmentWidth(segmentEl, true, precise);
    _scheduleControlsFadeout(segmentEl);

    _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_CHANGE_WIDTH, 
        TRACK_LABEL_INCREMENT_BUTTON, null, true);    
  }

  function _resizeSegment(el, resizeType, width, updateEdit, palette, initial) {
    if (!palette) {
      var width = 
          _normalizeSegmentWidth(width / TILE_SIZE, resizeType) * TILE_SIZE;
    }

    document.body.classList.add('immediate-segment-resize');

    window.setTimeout(function() {
      document.body.classList.remove('immediate-segment-resize');
    }, SHORT_DELAY);

    var oldWidth = parseFloat(el.getAttribute('width') * TILE_SIZE);

    el.style.width = width + 'px';
    el.setAttribute('width', width / TILE_SIZE);

    var widthEl = el.querySelector('span.width');
    if (widthEl) {
      widthEl.innerHTML = 
          _prettifyWidth(width / TILE_SIZE, PRETTIFY_WIDTH_OUTPUT_MARKUP);
    }

    _setSegmentContents(el, el.getAttribute('type'), 
      el.getAttribute('variant-string'), width, parseInt(el.getAttribute('rand-seed')), palette, false);

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

  function _createSegment(type, variantString, width, isUnmovable, palette, randSeed) {
    var el = document.createElement('div');
    el.classList.add('segment');
    el.setAttribute('type', type);
    el.setAttribute('variant-string', variantString);
    if (randSeed) {
      el.setAttribute('rand-seed', randSeed);
    }

    if (isUnmovable) {
      el.classList.add('unmovable');
    }
    
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

      var innerEl = document.createElement('span');
      innerEl.classList.add('grid');
      el.appendChild(innerEl);
    } else {
      el.setAttribute('title', SEGMENT_INFO[type].name);
    }

    if (width) {
      _resizeSegment(el, RESIZE_TYPE_INITIAL, width, true, palette, true);
    }

    if (!palette && !system.touch) {
      $(el).mouseenter(_onSegmentMouseEnter);
      $(el).mouseleave(_onSegmentMouseLeave);
    }      
    return el;
  }

  function _getBuildingAttributes(street, left) {
    var buildingVariant = left ? street.leftBuildingVariant : street.rightBuildingVariant;
    var flooredBuilding = _isFlooredBuilding(buildingVariant);

    // Non-directional

    switch (buildingVariant) {
      case 'narrow':
        var width = 216; 
        var floorRoofWidth = 216; 
        var variantsCount = 1; 
        var tileset = 2;

        var floorHeight = 10;
        var roofHeight = 1;
        var mainFloorHeight = 14;
        break;
      case 'wide':
        var width = 396;
        var floorRoofWidth = 396;
        var variantsCount = 1;
        var tileset = 3;

        var floorHeight = 10;
        var roofHeight = 1;
        var mainFloorHeight = 14;
        break;
      case 'residential':
        var width = 396;
        var floorRoofWidth = 240;
        var variantsCount = 0;

        var floorHeight = 10;
        var roofHeight = 6;
        var mainFloorHeight = 24.5;
        break;
      case 'waterfront':
        var height = 12 * TILE_SIZE;
        break;
      case 'parking-lot':
        var height = 28 * TILE_SIZE;
        break;
      case 'fence':
        var height = 12 * TILE_SIZE;
        break;
      case 'grass':
        var height = 6 * TILE_SIZE;
        break;
    }
    // Directional

    if (left) {
      switch (buildingVariant) {
        case 'narrow':
          var tilePositionX = 1512 + 17;
          var tilePositionY = 576 - 1;
          break;
        case 'wide':
          var tilePositionX = 1956;
          var tilePositionY = 576 - 24 * 2;
          break;
        case 'residential':
          var tileset = 3;
          var tilePositionX = 1956 + 382 + 204;
          var tilePositionY = 576 + 740 / 2 - 1 - 12 + 8;
          break;
      }
    } else {
      switch (buildingVariant) {
        case 'narrow':
          var tilePositionX = 1728 + 13;
          var tilePositionY = 576 - 1;
          break;
        case 'wide':
          var tilePositionX = 2351;
          var tilePositionY = 576 - 24 * 2 - 1;
          break;
        case 'residential':
          var tileset = 2;
          var tilePositionX = 1956 + 382 + 204 + 25 - 1008 - 12 - 1 + 48;
          var tilePositionY = 576 + 740 / 2 - 1 - 12 + 237 + 6;
          break;
      }
    }

    if (flooredBuilding) {
      var floorCount = left ? street.leftBuildingHeight : street.rightBuildingHeight;
      var height = (roofHeight + floorHeight * (floorCount - 1) + mainFloorHeight) * TILE_SIZE + 45;
      var realHeight = height - 45 - 6;
    }    

    return { tilePositionX: tilePositionX, tilePositionY: tilePositionY, 
             width: width, variantsCount: variantsCount, tileset: tileset, 
             mainFloorHeight: mainFloorHeight, floorHeight: floorHeight,
             flooredBuilding: flooredBuilding, floorRoofWidth: floorRoofWidth,
             floorCount: floorCount,
             realHeight: realHeight,
             roofHeight: roofHeight, height: height, buildingVariant: buildingVariant };
  }

  // TODO change to array
  function _isFlooredBuilding(buildingVariant) {
    if ((buildingVariant == 'narrow') || (buildingVariant == 'wide') || 
        (buildingVariant == 'residential')) {
      return true;
    } else {
      return false;
    }
  }

  function _drawBuilding(ctx, destination, street, left, totalWidth, 
                         totalHeight, bottomAligned, offsetLeft, offsetTop, 
                         multiplier) {
    var attr = _getBuildingAttributes(street, left);

    if (bottomAligned) {
      offsetTop += totalHeight - attr.height * multiplier;
    }

    if (!attr.flooredBuilding) {
      switch (attr.buildingVariant) {
        case 'fence': 
          var tileset = 1;
          if (left) {
            var x = 1344 / 2;            
          } else {
            var x = 1224 / 2;            
          }
          var width = 48;
          var y = 0;
          var height = 168 + 12 - 24 - 24 - 24;
          var offsetY = 23 + 24;
          offsetTop -= 45;

          if (left) {
            var posShift = (totalWidth % width) - 121;
          } else {
            var posShift = 25;
          }
          break;
        case 'grass':
          var tileset = 1;
          var x = 1104 / 2;
          var width = 48;
          var y = 0;
          var height = 168 + 12;
          var offsetY = 23 + 24 - 6 * 12;
          offsetTop -= 45;

          if (left) {
            var posShift = (totalWidth % width) - 121;
          } else {
            var posShift = 25;
          }
          break;

        case 'parking-lot':
          var tileset = 3;
          var width = 216;
          var height = 576 / 2;
          var offsetY = 3 + 45;
          offsetTop -= 45;

          if (left) {
            var posShift = (totalWidth % width) - width - width - 25;
            var y = 12 + 298;

            var x = 815 + 162 * 12;
            var lastX = 815 + 162 * 12 + 9 * 24;
          } else {
            var posShift = 25;
            var y = 12;

            var x = 815 + 162 * 12 + 9 * 24;
            var firstX = 815 + 162 * 12;
          }
          break;

        case 'waterfront':
          var tileset = 1;
          var width = 120;
          var height = 192 / 2;
          var offsetY = 24 + 24 + 45;
          offsetTop -= 45;

          if (left) {
            var posShift = (totalWidth % width) - width - width - 25;
            var y = 120;

            var x = 0;
            var lastX = 120;
          } else {
            var posShift = 25;
            var y = 456 / 2;

            var x = 120;
            var firstX = 0;
          }
          break;
      }

      var count = Math.floor(totalWidth / width) + 2;

      for (var i = 0; i < count; i++) {
        if ((i == 0) && (typeof firstX != 'undefined')) {
          var currentX = firstX;
        } else if ((i == count - 1) && (typeof lastX != 'undefined')) {
          var currentX = lastX;
        } else {
          var currentX = x;
        }

        _drawSegmentImage(tileset, ctx,
            currentX, y, width, height,
            offsetLeft + (posShift + i * width) * multiplier, 
            offsetTop + offsetY * multiplier, 
            width * multiplier, 
            height * multiplier);
      }
    } else {
      // Floored buildings

      if (left) {
        var leftPos = totalWidth - attr.width - 2;
      } else {
        var leftPos = 0;
      }

      offsetTop -= 45;

      // bottom floor

      _drawSegmentImage(attr.tileset, ctx,
          attr.tilePositionX, 
          attr.tilePositionY - 240 + 120 * attr.variantsCount, 
          attr.width, 
          attr.mainFloorHeight * TILE_SIZE + TILE_SIZE,
          offsetLeft + leftPos * multiplier, 
          offsetTop + (attr.height - attr.mainFloorHeight * TILE_SIZE) * multiplier, 
          attr.width * multiplier, 
          (attr.mainFloorHeight * TILE_SIZE + TILE_SIZE) * multiplier);

      // middle floors

      var floorCorrection = left ? 0 : (attr.width - attr.floorRoofWidth);

      var randomGenerator = new RandomGenerator();
      randomGenerator.seed(0);

      for (var i = 1; i < attr.floorCount; i++) {   
        if (attr.variantsCount == 0) {
          var variant = 0; 
        } else {
          var variant = Math.floor(randomGenerator.rand() * attr.variantsCount) + 1;
        }

        _drawSegmentImage(attr.tileset, ctx,
            attr.tilePositionX + floorCorrection, 
            attr.tilePositionY - 240 + 120 * attr.variantsCount - (attr.floorHeight * TILE_SIZE * variant), 
            attr.floorRoofWidth, 
            attr.floorHeight * TILE_SIZE,
            offsetLeft + (leftPos + floorCorrection) * multiplier, 
            offsetTop + attr.height * multiplier - (attr.mainFloorHeight + attr.floorHeight * i) * TILE_SIZE * multiplier, 
            attr.floorRoofWidth * multiplier, 
            attr.floorHeight * TILE_SIZE * multiplier);
      }

      // roof

      _drawSegmentImage(attr.tileset, ctx,
          attr.tilePositionX + floorCorrection, 
          attr.tilePositionY - 240 + 120 * attr.variantsCount - (attr.floorHeight * TILE_SIZE * attr.variantsCount + attr.roofHeight * TILE_SIZE), 
          attr.floorRoofWidth, 
          attr.roofHeight * TILE_SIZE,
          offsetLeft + (leftPos + floorCorrection) * multiplier, 
          offsetTop + attr.height * multiplier - (attr.mainFloorHeight + attr.floorHeight * (attr.floorCount - 1) + attr.roofHeight) * TILE_SIZE * multiplier, 
          attr.floorRoofWidth * multiplier, 
          attr.roofHeight * TILE_SIZE * multiplier);
    }

    if ((street.remainingWidth < 0) && (destination == BUILDING_DESTINATION_SCREEN)) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      // TODO const
      ctx.fillStyle = 'rgba(204, 163, 173, .9)';
      ctx.fillRect(0, 0, totalWidth * system.hiDpi, totalHeight * system.hiDpi);
      ctx.restore();
    }
  }

  function _createBuilding(el, left) {
    var totalWidth = 
        document.querySelector('#street-section-left-building').offsetWidth;

    var attr = _getBuildingAttributes(street, left);

    var height = Math.min(MAX_CANVAS_HEIGHT, attr.height);

    var canvasEl = document.createElement('canvas');
    canvasEl.width = totalWidth * system.hiDpi;
    canvasEl.height = height * system.hiDpi;
    canvasEl.style.width = totalWidth + 'px';
    canvasEl.style.height = height + 'px';

    el.appendChild(canvasEl);

    var ctx = canvasEl.getContext('2d');
    _drawBuilding(ctx, BUILDING_DESTINATION_SCREEN, street, left, 
                  totalWidth, height, true, 0, 0, 1.0);
  }

  function _buildingHeightUpdated() {
    _saveStreetToServerIfNecessary();
    _createBuildings();
  }

  function _changeBuildingHeight(left, increment) {
    if (left) {
      if (increment) {
        if (street.leftBuildingHeight < MAX_BUILDING_HEIGHT) {
          street.leftBuildingHeight++;
        }
      } else if (street.leftBuildingHeight > 1) {
        street.leftBuildingHeight--;
      }
    } else {
      if (increment) {
        if (street.rightBuildingHeight < MAX_BUILDING_HEIGHT) {
          street.rightBuildingHeight++;
        }
      } else if (street.rightBuildingHeight > 1) {
        street.rightBuildingHeight--;
      }
    }

    _infoBubble.updateHeightInContents(left);
    _buildingHeightUpdated();
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
        segment.width * TILE_SIZE, segment.unmovable, false, segment.randSeed);
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
    _resumeFadeoutControls();
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
    for (var i in street.segments) {
      var segment = street.segments[i];

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

  function _recalculateOccupiedWidth() {
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

    _buildStreetWidthMenu();
    _updateStreetMetadata();
  }

  function _recalculateWidth() {
    _recalculateOccupiedWidth();

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

    printingNeedsUpdating = true;
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

    _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_UNDO, 
        null, null, true);    
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

  function _generateRandSeed() {
    var randSeed = 1 + Math.floor(Math.random() * MAX_RAND_SEED); // So it’s not zero
    return randSeed;
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
      case 13:
        for (var i in street.segments) {
          var segment = street.segments[i];
          if (segment.type == 'sidewalk-wayfinding') {
            var variant = _getVariantArray(segment.type, segment.variantString);
            variant['wayfinding-type'] = 'large';
            segment.variantString =  _getVariantString(variant);
          }
        }
        break;
      case 14:
        for (var i in street.segments) {
          var segment = street.segments[i];
          if (segment.type == 'sidewalk') {
            segment.randSeed = 35;
          }
        }
        break;
      case 15:
        undoStack = [];
        undoPosition = 0;
        break;
    }

    street.schemaVersion++;
  }

  function _updateToLatestSchemaVersion(street) {
    var updated = false;
    while (!street.schemaVersion || (street.schemaVersion < LATEST_SCHEMA_VERSION)) {
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

    // FIXME just read it and do 0 otherwise
    if (typeof transmission.data.street.editCount == 'undefined') {
      //console.log('editCount read is empty');
      street.editCount = null;
    } else {
      street.editCount = transmission.data.street.editCount;
      //console.log('editCount read is', street.editCount);
    }

    return street;
  }

  function _unpackServerStreetData(transmission, id, namespacedId, checkIfNeedsToBeRemixed) {
    street = _unpackStreetDataFromServerTransmission(transmission);

    if (transmission.data.undoStack) {
      undoStack = _clone(transmission.data.undoStack);
      undoPosition = transmission.data.undoPosition;
    } else {
      undoStack = [];
      undoPosition = 0;
    }

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

    if (FLAG_SAVE_UNDO) {
      data.undoStack = _clone(undoStack);
      data.undoPosition = undoPosition;
    }

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
        inProgress: false,
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
        if (!request.inProgress) {
          request.inProgress = true;

          var query = $.ajax(request.request).done(function(data) {
            _successNonblockingAjaxRequest(data, request);
          }).fail(function(data) {
            _errorNonblockingAjaxRequest(data, request);
          });
        }
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

    request.inProgress = false;
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
    if (readOnly) {
      return;
    }

    var transmission = _packServerStreetData();

    if (initial) {
      // blocking

      $.ajax({
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
  }

  function _errorSavingSettingsToServer(data) {
    if (!abortEverything && (data.status == 401)) {
      _eventTracking.track(TRACK_CATEGORY_ERROR, TRACK_ACTION_ERROR_RM2, 
          null, null, false);

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

    $.ajax(blockingAjaxRequest).
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

    $.ajax(blockingAjaxRequest).
        done(_successBlockingAjaxRequest).fail(_errorBlockingAjaxRequest);
  }

  function _remixStreet() {
    if (readOnly) {
      return;
    }

    remixOnFirstEdit = false;

    if (signedIn) {
      _setStreetCreatorId(signInData.userId);
    } else {
      _setStreetCreatorId(null);
    }

    street.originalStreetId = street.id;
    street.editCount = 0;
    //console.log('editCount = 0 on remix!');

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
    settings.lastStreetId = street.id;
    settings.lastStreetNamespacedId = street.namespacedId;
    settings.lastStreetCreatorId = street.creatorId;

    _saveSettingsLocally();
  }

  function _unifyUndoStack() {
    for (var i = 0; i < undoStack.length; i++) {
      undoStack[i].id = street.id;
      undoStack[i].name = street.name;
      undoStack[i].namespacedId = street.namespacedId;
      undoStack[i].creatorId = street.creatorId;
      undoStack[i].updatedAt = street.updatedAt; 
    }
  }

  function _setStreetId(newId, newNamespacedId) {
    street.id = newId;
    street.namespacedId = newNamespacedId;

    _unifyUndoStack();

    _updateLastStreetInfo();
  }

  function _setStreetCreatorId(newId) {
    street.creatorId = newId;

    _unifyUndoStack();
    _updateLastStreetInfo();
  }

  function _addRemixSuffixToName() {
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
      if (street.editCount !== null) {
        street.editCount++;
        //console.log('increment editCount', street.editCount);
      } else {
        //console.log('not incrementing editCount since null');
      }
      _setUpdateTimeToNow();
      _hideWelcome();

      // As per issue #306.
      _statusMessage.hide();

      _updateStreetMetadata();

      _createNewUndoIfNecessary(lastStreet, currentData);

      _scheduleSavingStreetToServer();

      printingNeedsUpdating = true;
      lastStreet = currentData;

      _updateUndoButtons();
    }
  }

  function _checkIfChangesSaved() {
    // don’t do for settings deliberately

    if (abortEverything) {
      return;
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
    }
  }

  function _onWindowBeforeUnload() {
    var text = _checkIfChangesSaved();
    if (text) {
      return text;
    }
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

    if (street.editCount !== null) {
      //console.log('saving editCount', street.editCount);
      newData.editCount = street.editCount;
    } else {
      //console.log('not saving editCount');
    }

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
      if (street.segments[i].randSeed) {
        segment.randSeed = street.segments[i].randSeed;
      }

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
      if (el.getAttribute('rand-seed')) {
        segment.randSeed = parseInt(el.getAttribute('rand-seed'));
      }
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
    return;

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
  }

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
    if (readOnly) {
      return;
    }

    if (event.touches && event.touches[0]) {
      var x = event.touches[0].pageX;
      var y = event.touches[0].pageY;
    } else {
      var x = event.pageX;
      var y = event.pageY;
    }    

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

    draggingResize.mouseX = x;
    draggingResize.mouseY = y;

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
    _cancelFadeoutControls();
    _hideControls();

    window.setTimeout(function() {
      el.segmentEl.classList.add('hover');
    }, 0);

    _showWidthChartImmediately();
  }

  function _handleSegmentResizeMove(event) {
    if (event.touches && event.touches[0]) {
      var x = event.touches[0].pageX;
      var y = event.touches[0].pageY;
    } else {
      var x = event.pageX;
      var y = event.pageY;
    }    

    var deltaX = x - draggingResize.mouseX;
    var deltaY = y - draggingResize.mouseY;

    var deltaFromOriginal = draggingResize.elX - draggingResize.originalX;
    if (!draggingResize.right) {
      deltaFromOriginal = -deltaFromOriginal;
    }

    draggingResize.elX += deltaX;
    draggingResize.floatingEl.style.left = (draggingResize.elX - document.querySelector('#street-section-outer').scrollLeft) + 'px';

    draggingResize.width = draggingResize.originalWidth + deltaFromOriginal / TILE_SIZE * 2;
    var precise = event.shiftKey;

    if (precise) {
      var resizeType = RESIZE_TYPE_PRECISE_DRAGGING;
    } else {
      var resizeType = RESIZE_TYPE_DRAGGING;
    }

    _resizeSegment(draggingResize.segmentEl, resizeType,
        draggingResize.width * TILE_SIZE, true, false);

    draggingResize.mouseX = x;
    draggingResize.mouseY = y;

    // TODO hack so it doesn’t disappear
    _showWidthChartImmediately();
  }  

  function _handleSegmentClickOrMoveStart(event) {
    if (readOnly) {
      return;
    }

    ignoreStreetChanges = true;

    if (event.touches && event.touches[0]) {
      var x = event.touches[0].pageX;
      var y = event.touches[0].pageY;
    } else {
      var x = event.pageX;
      var y = event.pageY;
    }    

    var el = event.target;
    draggingMove.originalEl = el;

    _changeDraggingType(DRAGGING_TYPE_CLICK_OR_MOVE);    

    draggingMove.mouseX = x;
    draggingMove.mouseY = y;
  }

  function _handleSegmentMoveStart() {
    if (readOnly) {
      return;
    }

    _changeDraggingType(DRAGGING_TYPE_MOVE);    

    draggingMove.originalType = draggingMove.originalEl.getAttribute('type');

    if (draggingMove.originalEl.classList.contains('palette')) {
      if (SEGMENT_INFO[draggingMove.originalType].needRandSeed) {
        draggingMove.originalRandSeed = _generateRandSeed();        
      }
      draggingMove.type = DRAGGING_TYPE_MOVE_CREATE;
      draggingMove.originalWidth = 
          SEGMENT_INFO[draggingMove.originalType].defaultWidth * TILE_SIZE;

      // TODO hack to get the first
      for (var j in SEGMENT_INFO[draggingMove.originalType].details) {
        draggingMove.originalVariantString = j;
        break;
      }
    } else {
      draggingMove.originalRandSeed = 
          parseInt(draggingMove.originalEl.getAttribute('rand-seed'));
      draggingMove.type = DRAGGING_TYPE_MOVE_TRANSFER;      
      draggingMove.originalWidth = 
          draggingMove.originalEl.offsetWidth;
      draggingMove.originalVariantString = 
          draggingMove.originalEl.getAttribute('variant-string');
    }

    var pos = _getElAbsolutePos(draggingMove.originalEl);

    draggingMove.elX = pos[0];
    draggingMove.elY = pos[1];

    if (draggingMove.type == DRAGGING_TYPE_MOVE_CREATE) {
      draggingMove.elY += DRAG_OFFSET_Y_PALETTE;
      draggingMove.elX -= draggingMove.originalWidth / 3;
    } else {
      draggingMove.elX -= document.querySelector('#street-section-outer').scrollLeft;
    }

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
        draggingMove.originalWidth,
        draggingMove.originalRandSeed,
        false, false);
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

    _infoBubble.hide();
    _cancelFadeoutControls();
    _hideControls();
  }

  function _updateWithinCanvas(_newWithinCanvas) {
    draggingMove.withinCanvas = _newWithinCanvas;    

    if (draggingMove.withinCanvas) {
      document.body.classList.remove('not-within-canvas');
    } else {
      document.body.classList.add('not-within-canvas');
    }
  }

  function _handleSegmentClickOrMoveMove(event) {
    if (event.touches && event.touches[0]) {
      var x = event.touches[0].pageX;
      var y = event.touches[0].pageY;
    } else {
      var x = event.pageX;
      var y = event.pageY;
    }    

    var deltaX = x - draggingMove.mouseX;
    var deltaY = y - draggingMove.mouseY;

    // TODO const
    if ((Math.abs(deltaX) > 5) || (Math.abs(deltaY) > 5)) {
      _handleSegmentMoveStart();
      _handleSegmentMoveMove(event);
    }
  }

  function _handleSegmentMoveMove(event) {
    if (event.touches && event.touches[0]) {
      var x = event.touches[0].pageX;
      var y = event.touches[0].pageY;
    } else {
      var x = event.pageX;
      var y = event.pageY;
    }    

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
          smartDrop.width, 
          draggingMove.originalRandSeed, false, true);

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

    if (readOnly || (event.touches && event.touches.length != 1)) {
      return;
    }

    var topEl = event.target;

    // For street width editing on Firefox

    while (topEl && (topEl.id != 'street-width')) {
      topEl = topEl.parentNode;
    }

    var withinMenu = !!topEl;

    if (withinMenu) {
      return;
    }

    _loseAnyFocus();
    _hideDebugInfo();

    var topEl = event.target;    

    while (topEl && (topEl.id != 'info-bubble') && (topEl.id != 'street-width') &&
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

      _handleSegmentClickOrMoveStart(event);
    }

    event.preventDefault();
  }

  function _makeSpaceBetweenSegments(x, y) {
    var left = x - streetSectionCanvasLeft;

    var selectedSegmentBefore = null;
    var selectedSegmentAfter = null;

    if (street.segments.length) { 
      var farLeft = street.segments[0].el.savedNoMoveLeft;
      var farRight = 
          street.segments[street.segments.length - 1].el.savedNoMoveLeft + 
          street.segments[street.segments.length - 1].el.savedWidth;
    } else {
      var farLeft = 0;
      var farRight = street.width * TILE_SIZE;
    }
    // TODO const
    var space = (street.width - street.occupiedWidth) * TILE_SIZE / 2;
    if (space < 100) {
      space = 100;
    }

    // TODO const
    if ((left < farLeft - space) || (left > farRight + space) || 
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
    if (draggingType == DRAGGING_TYPE_NONE) {
      return;
    }

    switch (draggingType) {
      case DRAGGING_TYPE_CLICK_OR_MOVE:
        _handleSegmentClickOrMoveMove(event);
        break;
      case DRAGGING_TYPE_MOVE:
        _handleSegmentMoveMove(event);
        break;
      case DRAGGING_TYPE_RESIZE:
        _handleSegmentResizeMove(event);
        break;
    }

    event.preventDefault();
  }

  var controlsFadeoutDelayTimer = -1;
  var controlsFadeoutHideTimer = -1;

  function _scheduleControlsFadeout(el) {
    _infoBubble.considerShowing(null, el, INFO_BUBBLE_TYPE_SEGMENT);

    _resumeFadeoutControls();
  }

  function _resumeFadeoutControls() {
    if (!system.touch) {
      return;
    }

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
    document.body.classList.remove('controls-fade-out'); 
    if (_infoBubble.segmentEl) {
      _infoBubble.segmentEl.classList.remove('show-drag-handles');   

      window.setTimeout(function() {
        _infoBubble.hide();
        _infoBubble.hideSegment(true);
      }, 0);
    }    
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

    // Bike rack orientation

    if (type == 'sidewalk-bike-rack') {
      if (left && (leftOwner != SEGMENT_OWNER_PEDESTRIAN)) {
        variant['orientation'] = 'left';
      } else if (right && (rightOwner != SEGMENT_OWNER_PEDESTRIAN)) {
        variant['orientation'] = 'right';
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

      _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_REMOVE_SEGMENT, 
          TRACK_LABEL_DRAGGING, null, true);
    } else if (draggingMove.segmentBeforeEl || draggingMove.segmentAfterEl || (street.segments.length == 0)) {
      var smartDrop = _doDropHeuristics(draggingMove.originalType, 
          draggingMove.originalVariantString, draggingMove.originalWidth);
      
      var newEl = _createSegment(smartDrop.type,
          smartDrop.variantString, smartDrop.width, false, false, draggingMove.originalRandSeed);

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
        draggingResize.originalWidth * TILE_SIZE, true, false);

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

    if (draggingResize.width && (draggingResize.originalWidth != draggingResize.width)) {
      _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_CHANGE_WIDTH, 
          TRACK_LABEL_DRAGGING, null, true);    
    }
  }

  function _onBodyMouseUp(event) {
    switch (draggingType) {
      case DRAGGING_TYPE_NONE:
        return;
      case DRAGGING_TYPE_CLICK_OR_MOVE:
        _changeDraggingType(DRAGGING_TYPE_NONE);
        ignoreStreetChanges = false;

        // click!
        //_nextSegmentVariant(draggingMove.originalEl.dataNo);
        break;
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
    for (var id in SEGMENT_INFO) {
      var segmentInfo = SEGMENT_INFO[id];

      if (segmentInfo.secret && !debug.secretSegments) {
        break;
      }

      // TODO hack to get the first variant name
      for (var j in segmentInfo.details) {
        var variantName = j;
        break;
      }

      // TODO hardcoded
      switch (id) {
        case 'sidewalk-lamp':
          variantName = 'both|traditional';
          break;
        case 'divider':
          variantName = 'bollard';
          break;
        case 'transit-shelter':
          variantName = 'right|light-rail';
          break;
        case 'sidewalk-bike-rack':
          variantName = 'left|sidewalk';
          break;
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
        true,
        _generateRandSeed());

      el.classList.add('palette');

      document.querySelector('.palette-canvas').appendChild(el);
    }
  }

  function _resizeStreetWidth(dontScroll) {
    var width = street.width * TILE_SIZE;

    document.querySelector('#street-section-canvas').style.width = width + 'px';
    if (!dontScroll) {
      document.querySelector('#street-section-outer').scrollLeft = 
          (width + BUILDING_SPACE * 2 - system.viewportWidth) / 2;
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
      document.querySelector('#street-name').style.width = 
          streetNameCanvasWidth + 'px';
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
    document.querySelector('#gallery-shield').style.width = 0;
    window.setTimeout(function() {
      document.querySelector('#gallery-shield').style.height = 
          system.viewportHeight + 'px';
      document.querySelector('#gallery-shield').style.width = 
          document.querySelector('#street-section-outer').scrollWidth + 'px';
    }, 0);
  }

  function _onResize() {
    system.viewportWidth = window.innerWidth;
    system.viewportHeight = window.innerHeight;

    var streetSectionHeight = 
        document.querySelector('#street-section-inner').offsetHeight;

    var paletteTop = 
        document.querySelector('#main-screen > footer').offsetTop || system.viewportHeight;

    // TODO const
    if (system.viewportHeight - streetSectionHeight > 450) {
      streetSectionTop = 
          (system.viewportHeight - streetSectionHeight - 450) / 2 + 450 + 80;
    } else {
      streetSectionTop = system.viewportHeight - streetSectionHeight + 70;
    }
    
    if (readOnly) {
      streetSectionTop += 80;
    }

    // TODO const
    if (streetSectionTop + document.querySelector('#street-section-inner').offsetHeight > 
      paletteTop - 20 + 180) { // gallery height
      streetSectionTop = paletteTop - 20 - streetSectionHeight + 180;
    }

    _updateGalleryShield();

    document.querySelector('#street-section-inner').style.top = streetSectionTop + 'px';

    document.querySelector('#street-section-sky').style.top = 
        (streetSectionTop * .8) + 'px';

    document.querySelector('#street-scroll-indicator-left').style.top = 
        (streetSectionTop + streetSectionHeight) + 'px';
    document.querySelector('#street-scroll-indicator-right').style.top = 
        (streetSectionTop + streetSectionHeight) + 'px';

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
    _updateStreetScrollIndicators();
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

    var width = pos[0] + 25;

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

      if (SEGMENT_INFO[segment.type].needRandSeed) {
        segment.randSeed = _generateRandSeed();        
      }

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
    el.innerHTML = 'Occupied width:';
    document.querySelector('#street-width').appendChild(el);  

    var el = document.createElement('option');
    el.disabled = true;
    el.innerHTML = _prettifyWidth(street.occupiedWidth, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);
    document.querySelector('#street-width').appendChild(el);      

    var el = document.createElement('option');
    el.disabled = true;
    document.querySelector('#street-width').appendChild(el);      

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

  function _nextSegmentVariant(dataNo) {
    var segment = street.segments[dataNo];

    var segmentInfo = SEGMENT_INFO[segment.type];

    var nextVariantString = '';
    var found = 0;
    for (var i in segmentInfo.details) {
      if (found == 1) {
        nextVariantString = i;
        break;
      }
      if (i == segment.variantString) {
        found = 1;
      }
    }

    if (!nextVariantString) {
      // TODO hack
      for (var i in segmentInfo.details) {
        nextVariantString = i;
        break;
      }
    }

    _changeSegmentVariant(dataNo, null, null, nextVariantString);
  }

  function _changeSegmentVariant(dataNo, variantName, variantChoice, variantString) {
    var segment = street.segments[dataNo];

    if (variantString) {
      segment.variantString = variantString;
      segment.variant = _getVariantArray(segment.type, segment.variantString);
    } else {
      segment.variant[variantName] = variantChoice;
      segment.variantString = _getVariantString(segment.variant);
    }

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
  }

  function _removeSegment(el, all) {
    if (all) {
      street.segments = [];
      _createDomFromData();
      _segmentsChanged();

      _infoBubble.hide();

      _statusMessage.show(msg('STATUS_ALL_SEGMENTS_DELETED'), true);
    } else if (el && el.parentNode) {
      _infoBubble.hide();
      _infoBubble.hideSegment();
      _switchSegmentElAway(el);
      _segmentsChanged();

      _statusMessage.show(msg('STATUS_SEGMENT_DELETED'), true);
    }

    /*if (street.segments.length) {
      _showWidthChartImmediately();
      _hideWidthChart();
    }*/
  } 

  function _getHoveredSegmentEl() {
    var el = document.querySelector('.segment.hover');
    return el;
  }

  function _getHoveredEl() {
    var el = document.querySelector('.hover');
    return el;
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

  function _scrollStreet(left, far) {
    var el = document.querySelector('#street-section-outer');
    $(el).stop(true, true);

    if (left) {
      if (far) {
        var newScrollLeft = 0;
      } else {
        var newScrollLeft = el.scrollLeft - (el.offsetWidth * .5);
      }
    } else {
      if (far) {
        var newScrollLeft = el.scrollWidth - el.offsetWidth;
      } else {
        var newScrollLeft = el.scrollLeft + (el.offsetWidth * .5);
      }
    }

    // TODO const
    $(el).animate({ scrollLeft: newScrollLeft }, 300);
  }

  function _onBodyKeyDown(event) {
    switch (event.keyCode) {
      case KEY_SLASH:
        _onHelpMenuClick();
        break;

      case KEY_EQUAL:
      case KEY_EQUAL_ALT:
      case KEY_PLUS_KEYPAD:
      case KEY_MINUS:
      case KEY_MINUS_ALT:
      case KEY_MINUS_KEYPAD:
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }

        var negative = (event.keyCode == KEY_MINUS) || 
           (event.keyCode == KEY_MINUS_ALT) || 
           (event.keyCode == KEY_MINUS_KEYPAD);

        var hoveredEl = _getHoveredEl();
        if (hoveredEl) {
          if (hoveredEl.classList.contains('segment')) {
            _incrementSegmentWidth(hoveredEl, !negative, event.shiftKey);
          } else if (hoveredEl.id == 'street-section-left-building') {
            _changeBuildingHeight(true, !negative);
          } else if (hoveredEl.id == 'street-section-right-building') {
            _changeBuildingHeight(false, !negative);
          }
          event.preventDefault();

          _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_CHANGE_WIDTH, 
              TRACK_LABEL_KEYBOARD, null, true);    
        }
        break;
      case KEY_BACKSPACE:
      case KEY_DELETE:
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }

        var segmentHoveredEl = _getHoveredSegmentEl();
        _removeSegment(segmentHoveredEl, event.shiftKey);

        _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_REMOVE_SEGMENT, 
            TRACK_LABEL_KEYBOARD, null, true);        

        event.preventDefault();
        break;
      case KEY_LEFT_ARROW:
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }
        _scrollStreet(true, event.shiftKey);
        event.preventDefault();
        break;
      case KEY_RIGHT_ARROW:
        if (event.metaKey || event.ctrlKey || event.altKey) {
          return;
        }
        _scrollStreet(false, event.shiftKey);
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
        if (event.shiftKey) {
          _showDebugInfo();
          event.preventDefault();
        }
        break;
      }    
  }

  function _onGlobalKeyDown(event) {
    if (_isFocusOnBody()) {
      _onBodyKeyDown(event); 
    }

    switch (event.keyCode) {
      case KEY_ESC:
        if (document.querySelector('#debug').classList.contains('visible')) {
          _hideDebugInfo();
        } else if (document.querySelector('#welcome').classList.contains('visible')) {
          _hideWelcome();
        } else if (document.querySelector('#save-as-image-dialog').classList.contains('visible')) {
          _hideSaveAsImageDialogBox();
        } else if (document.querySelector('#about').classList.contains('visible')) {
          _hideAboutDialogBox();
        } else if (draggingType == DRAGGING_TYPE_RESIZE) {
          _handleSegmentResizeCancel();
        } else if (draggingType == DRAGGING_TYPE_MOVE) {
          _handleSegmentMoveCancel();
        } else if (menuVisible) {
          _hideMenus();
        } else if (document.querySelector('#status-message').classList.contains('visible')) {
          _statusMessage.hide();
        } else if (_infoBubble.visible && _infoBubble.descriptionVisible) {
          _infoBubble.hideDescription();
        } else if (_infoBubble.visible) {
          _infoBubble.hide();
          _infoBubble.hideSegment(false);
        } else if (document.body.classList.contains('gallery-visible')) {
          _hideGallery(false);
        } else if (signedIn) {
          _showGallery(signInData.userId, false);
        } else {
          return;
        }

        event.preventDefault();
        break;
    }
  }

  function _onRemoveButtonClick(event) {
    var el = event.target.segmentEl;

    if (el) {
      _removeSegment(el, event.shiftKey);

      _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_REMOVE_SEGMENT, 
          TRACK_LABEL_BUTTON, null, true);              
    }

    // Prevent this “leaking” to a segment below
    event.preventDefault();
  }

  function _normalizeSlug(slug) {
    slug = slug.toLowerCase();
    slug = slug.replace(/ /g, '-');
    slug = slug.replace(/-{2,}/, '-');
    slug = slug.replace(/[^a-zA-Z0-9\-]/g, '');
    slug = slug.replace(/^[-]+|[-]+$/g, '');

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
    if (debug.canvasRectangles) {
      // TODO const
      url += '&debug-canvas-rectangles';
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
    if (debug.forceNonRetina) {
      url += '&debug-force-non-retina';
    }
    if (debug.secretSegments) {
      url += '&debug-secret-segments';
    }
    if (debug.forceReadOnly) {
      url += '&debug-force-read-only';
    }
    if (debug.forceTouch) {
      url += '&debug-force-touch';
    }
    if (debug.forceLiveUpdate) {
      url += '&debug-force-live-update';      
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

  // TODO unify with above (this one doesn’t have author, for Facebook sharing)
  function _getPageTitle() {
    return street.name + '– Streetmix';
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

  function _streetNameNeedsUnicodeFont(name) {
    var needUnicodeFont = false;
    for (var i in name) {
      if (STREET_NAME_FONT_GLYPHS.indexOf(name.charAt(i)) == -1) {
        needUnicodeFont = true;
        break;
      }
    }    

    return needUnicodeFont;
  }

  function _updateStreetNameFont(el) {
    var name = el.querySelector('div').innerHTML;

    var needUnicodeFont = _streetNameNeedsUnicodeFont(name);

    if (!needUnicodeFont) {
      el.classList.remove('fallback-unicode-font');
    } else {
      el.classList.add('fallback-unicode-font');
    }
  }

  function _updateStreetMetadata() {
    var html = _prettifyWidth(street.width, PRETTIFY_WIDTH_OUTPUT_MARKUP) + ' width';
    document.querySelector('#street-width-read-width').innerHTML = html;

    if (street.remainingWidth > 0) {
      var html = '<span class="under">(' + _prettifyWidth(street.remainingWidth, PRETTIFY_WIDTH_OUTPUT_MARKUP) + ' room)</span>';
    } else if (street.remainingWidth < 0) {
      var html = '<span class="over">(' + _prettifyWidth(-street.remainingWidth, PRETTIFY_WIDTH_OUTPUT_MARKUP) + ' over)</span>'; 
    } else {
      var html = '';
    }
    document.querySelector('#street-width-read-difference').innerHTML = html;

    if (street.creatorId && (!signedIn || (street.creatorId != signInData.userId))) {
      // TODO const
      var html = "by <div class='avatar' userId='" + street.creatorId + "'></div>" +
          "<a class='user-gallery' href='/" +  
          street.creatorId + "'>" + street.creatorId + "</a>";
          
      document.querySelector('#street-metadata-author').innerHTML = html;

      _fetchAvatars();

      if (!readOnly) {
        document.querySelector('#street-metadata-author .user-gallery').
            addEventListener('click', _onAnotherUserIdClick);
      }
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
    name = $.trim(name);

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

    latestRequestId = _getUniqueRequestHeader();
    latestVerificationStreet = _trimStreetData(street);

    $.ajax({
      url: url,
      dataType: 'json',
      type: 'GET',
      // TODO const
      headers: { 'X-Streetmix-Request-Id': latestRequestId }
    }).done(_receiveStreetForVerification).fail(_errorReceiveStreetForVerification);
  }

  function _receiveStreetForVerification(transmission, textStatus, request) {
    var requestId = parseInt(request.getResponseHeader('X-Streetmix-Request-Id'));

    if (requestId != latestRequestId) {
      return;
    }

    var localStreetData = _trimStreetData(latestVerificationStreet);
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

      _infoBubble.suppress();

      _unpackServerStreetData(transmission, null, null, false);
      _updateEverything(true);

      _eventTracking.track(TRACK_CATEGORY_EVENT, 
          TRACK_ACTION_STREET_MODIFIED_ELSEWHERE, null, null, false);
    }
  }

  function _errorReceiveStreetForVerification(data) {
    // 404 should never happen here, since 410 designates streets that have
    // been deleted (but remain hidden on the server)

    if (signedIn && ((data.status == 404) || (data.status == 410))) {
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
    _newBlockingAjaxRequest(msg('LOADING'), 
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
    street.editCount = 0;
    //console.log('editCount = 0 on last street!');

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

  function _showWelcome() {
    if (readOnly || system.phone) {
      return;
    }

    var welcomeType = WELCOME_NONE;

     _loadSettingsWelcomeDismissed();

    if (mode == MODE_NEW_STREET) {
      if (signedIn || settingsWelcomeDismissed) {
        welcomeType = WELCOME_NEW_STREET;
      } else {
        welcomeType = WELCOME_FIRST_TIME_NEW_STREET;
      }
    } else {
      if (!settingsWelcomeDismissed) {
        welcomeType = WELCOME_FIRST_TIME_EXISTING_STREET;
      }
    }


    if (welcomeType == WELCOME_NONE) {
      return;
    }

    switch (welcomeType) {
      case WELCOME_FIRST_TIME_NEW_STREET:
        document.querySelector('#welcome').classList.add('first-time-new-street');
        break;
      case WELCOME_FIRST_TIME_EXISTING_STREET:
        document.querySelector('#welcome').classList.add('first-time-existing-street');

        document.querySelector('#welcome-new-street').addEventListener('click', function() {
          settingsWelcomeDismissed = true;
          _saveSettingsWelcomeDismissed();
          _goNewStreet(true);
        });

        $('#welcome-street-name').text(street.name);

        if (street.creatorId) {
          document.querySelector('#welcome-avatar-creator').classList.add('visible');
          $('#welcome-avatar').attr('userId', street.creatorId);
          $('#welcome-creator').text(street.creatorId);
        }
        _fetchAvatars();
        break;
      case WELCOME_NEW_STREET:
        document.querySelector('#welcome').classList.add('new-street');

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
        break;
    }

    document.querySelector('#welcome').classList.add('visible');
    document.querySelector('#street-name-canvas').classList.add('hidden');
  }

  function _hideWelcome() {
    settingsWelcomeDismissed = true;
    _saveSettingsWelcomeDismissed();

    document.querySelector('#welcome').classList.remove('visible');
    document.querySelector('#street-name-canvas').classList.remove('hidden');
  }


  // TODO move
  var SAVE_AS_IMAGE_DPI = 2.0;
  var SAVE_AS_IMAGE_MIN_HEIGHT = 400;
  var SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME = SAVE_AS_IMAGE_MIN_HEIGHT + 150;
  var SAVE_AS_IMAGE_BOTTOM_PADDING = 60;
  var SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING = 65;

  function _getStreetImage(transparentSky, segmentNamesAndWidths, streetName) {
    var width = TILE_SIZE * street.width + BUILDING_SPACE * 2;

    var leftBuildingAttr = _getBuildingAttributes(street, true);
    var rightBuildingAttr = _getBuildingAttributes(street, false);

    var leftHeight = leftBuildingAttr.height;
    var rightHeight = rightBuildingAttr.height;

    var height = Math.max(leftHeight, rightHeight);
    if (height < SAVE_AS_IMAGE_MIN_HEIGHT) {
      height = SAVE_AS_IMAGE_MIN_HEIGHT;
    }

    if (streetName && (height < SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME)) {
      height = SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME;
    }

    height += SAVE_AS_IMAGE_BOTTOM_PADDING;

    if (segmentNamesAndWidths) {
      height += SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING;
    }

    var el = document.createElement('canvas');
    el.width = width * SAVE_AS_IMAGE_DPI;
    el.height = height * SAVE_AS_IMAGE_DPI;

    var ctx = el.getContext('2d');

    // TODO hack
    var oldDpi = system.hiDpi;
    system.hiDpi = SAVE_AS_IMAGE_DPI;
    _drawStreetThumbnail(ctx, street, width, height, 1.0, false, true, transparentSky, segmentNamesAndWidths, streetName);
    system.hiDpi = oldDpi;

    return el;
  }

  function _saveAsImagePreviewReady() {
    document.querySelector('#save-as-image-preview-loading').classList.remove('visible');
    document.querySelector('#save-as-image-preview-preview').classList.add('visible');    
  }

  function _updateSaveAsImageDialogBox() {    
    document.querySelector('#save-as-image-preview-loading').classList.add('visible');
    document.querySelector('#save-as-image-preview-preview').classList.remove('visible');

    window.setTimeout(_updateSaveAsImageDialogBoxPart2, 50);
  }

  function _updateSaveAsImageDialogBoxPart2() {
    document.querySelector('#save-as-image-preview-preview').innerHTML = '';

    var el = _getStreetImage(settings.saveAsImageTransparentSky, settings.saveAsImageSegmentNamesAndWidths, settings.saveAsImageStreetName);
    var dataUrl = el.toDataURL('image/png');

    var imgEl = document.createElement('img');
    imgEl.addEventListener('load', _saveAsImagePreviewReady);
    imgEl.src = dataUrl;
    document.querySelector('#save-as-image-preview-preview').appendChild(imgEl);

    var filename = _normalizeSlug(street.name);
    if (!filename) {
      filename = 'street';
    }
    filename += '.png';

    document.querySelector('#save-as-image-download').download = filename;
    document.querySelector('#save-as-image-download').href = dataUrl;
  }

  function _updateSaveAsImageOptions() {
    settings.saveAsImageTransparentSky = 
        document.querySelector('#save-as-image-transparent-sky').checked;
    settings.saveAsImageSegmentNamesAndWidths = 
        document.querySelector('#save-as-image-segment-names').checked;
    settings.saveAsImageStreetName = 
        document.querySelector('#save-as-image-street-name').checked;

    _saveSettingsLocally();  

    window.setTimeout(function() { _updateSaveAsImageDialogBox(); }, 0);
  }

  function _showSaveAsImageDialogBox(event) {
    _hideMenus();

    document.querySelector('#save-as-image-transparent-sky').checked =
        settings.saveAsImageTransparentSky;
        
    document.querySelector('#save-as-image-segment-names').checked = 
        settings.saveAsImageSegmentNamesAndWidths;

    document.querySelector('#save-as-image-street-name').checked = 
        settings.saveAsImageStreetName;

    document.querySelector('#save-as-image-preview-loading').classList.add('visible');
    document.querySelector('#save-as-image-preview-preview').classList.remove('visible');    

    window.setTimeout(function() { _updateSaveAsImageDialogBox(); }, 100);

    document.querySelector('#save-as-image-dialog').classList.add('visible');
    document.querySelector('#dialog-box-shield').classList.add('visible');    

    _eventTracking.track(TRACK_CATEGORY_SHARING, TRACK_ACTION_SAVE_AS_IMAGE, null, null, false);

    if (event) {
      event.preventDefault();
    }
  }

  function _hideSaveAsImageDialogBox() {
    document.querySelector('#save-as-image-dialog').classList.remove('visible');
    document.querySelector('#dialog-box-shield').classList.remove('visible');
  }

  function _showAboutDialogBox(event) {
    if (event && (event.shiftKey || event.ctrlKey || event.metaKey)) {
      return;
    }

    _hideMenus();

    document.querySelector('#about').classList.add('visible');
    document.querySelector('#dialog-box-shield').classList.add('visible');

    var els = document.querySelectorAll('#about .avatar');
    for (var i = 0, el; el = els[i]; i++) {
      el.removeAttribute('postpone');
    }

    window.history.replaceState(null, null, URL_HELP_ABOUT);    

    _fetchAvatars();

    if (event) {
      event.preventDefault();
    }
  }

  function _hideAboutDialogBox() {
    document.querySelector('#about').classList.remove('visible');
    document.querySelector('#dialog-box-shield').classList.remove('visible');

    _updatePageUrl();
  }

  function _fetchGalleryData() {
    if (galleryUserId) {
      $.ajax({
        // TODO const
        url: API_URL + 'v1/users/' + galleryUserId + '/streets',
        dataType: 'json',
        type: 'GET',
        headers: { 'Authorization': _getAuthHeader() }
      }).done(_receiveGalleryData).fail(_errorReceiveGalleryData);
    } else {
      $.ajax({
        // TODO const
        url: API_URL + 'v1/streets?count=200',
        dataType: 'json',
        type: 'GET'
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
    _showBlockingShield();

    $.ajax({
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

    _recalculateOccupiedWidth();

    // TODO this is stupid, only here to fill some structures
    _createDomFromData();
    _createDataFromDom();

    _hideWelcome();
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
    var todayFormat = today.format(DATE_FORMAT);
    var dateFormat = date.format(DATE_FORMAT);

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
      message = msg('LOADING');
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
          var text = msg('STREET_COUNT_0');
          break;
        case 1:
          var text = msg('STREET_COUNT_1');
          break;
        default:
          var text = msg('STREET_COUNT_MANY', { streetCount: streetCount });
          break;
      }
    } else {
      var text = '';
    }
    document.querySelector('#gallery .street-count').innerHTML = text;
  }

  function _receiveGalleryData(transmission) {
    document.querySelector('#gallery .loading').classList.remove('visible');

    for (var i in transmission.streets) {
      var galleryStreet = transmission.streets[i];
      _updateToLatestSchemaVersion(galleryStreet.data.street);

      var el = document.createElement('li');

      var anchorEl = document.createElement('a');

      /*if (!galleryUserId && (galleryStreet.data.undoStack.length <= 4)) {
        anchorEl.classList.add('virgin');
      }*/

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
          THUMBNAIL_WIDTH * 2, THUMBNAIL_HEIGHT * 2, THUMBNAIL_MULTIPLIER, true, false, true, false, false);
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
        removeEl.innerHTML = msg('UI_GLYPH_X');
        removeEl.title = msg('TOOLTIP_DELETE_STREET');
        anchorEl.appendChild(removeEl);
      }

      el.appendChild(anchorEl);
      document.querySelector('#gallery .streets').appendChild(el);
    }

    var streetCount = document.querySelectorAll('#gallery .streets li').length;

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
    if (readOnly) {
      return;
    }

    _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_OPEN_GALLERY, 
        userId, null, false);

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

    _hideControls();
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
    message = $.trim(message);

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
        contentType: 'application/json'
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

  function _updateStreetScrollIndicators() {
    var el = document.querySelector('#street-section-outer');

    if (el.scrollWidth <= el.offsetWidth) {
      var posLeft = 0;
      var posRight = 0;
    } else {
      var left = el.scrollLeft / (el.scrollWidth - el.offsetWidth);
      
      // TODO const off max width street
      var posMax = Math.round(street.width / MAX_CUSTOM_STREET_WIDTH * 6);
      if (posMax < 2) {
        posMax = 2;
      }

      var posLeft = Math.round(posMax * left);
      if ((left > 0) && (posLeft == 0)) {
        posLeft = 1;
      }
      if ((left < 1.0) && (posLeft == posMax)) {
        posLeft = posMax - 1;
      }
      var posRight = posMax - posLeft;
    }

    document.querySelector('#street-scroll-indicator-left').innerHTML = Array(posLeft + 1).join('‹');
    document.querySelector('#street-scroll-indicator-right').innerHTML = Array(posRight + 1).join('›');
  }

  function _onStreetSectionScroll(event) {
    _infoBubble.suppress();

    var scrollPos = document.querySelector('#street-section-outer').scrollLeft;

    var pos = -scrollPos * 0.5;
    document.querySelector('#street-section-sky .front-clouds').style[system.cssTransform] = 
        'translateX(' + pos + 'px)'; 

    var pos = -scrollPos * 0.25;
    document.querySelector('#street-section-sky .rear-clouds').style[system.cssTransform] = 
        'translateX(' + pos + 'px)'; 

    _updateStreetScrollIndicators();

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function _onStreetLeftScrollClick(event) {
    _scrollStreet(true, event.shiftKey);
  }
  function _onStreetRightScrollClick(event) {
    _scrollStreet(false, event.shiftKey);
  }

  function _shareViaTwitter() {
    _eventTracking.track(TRACK_CATEGORY_SHARING, TRACK_ACTION_TWITTER, null, null, false);    
  }

  function _shareViaFacebook() {
    _eventTracking.track(TRACK_CATEGORY_SHARING, TRACK_ACTION_FACEBOOK, null, null, false);    
  }

  // TODO hack
  function _hideDialogBoxes() {
    _hideAboutDialogBox();
    _hideSaveAsImageDialogBox();
  }

  function _updatePrintImage() {
    if (printingNeedsUpdating) {
      // Chrome fires _onBeforePrint twice.
      document.querySelector('#print > div').innerHTML = '';

      var el = _getStreetImage(true, true);
      var dataUrl = el.toDataURL('image/png');

      var imgEl = document.createElement('img');
      imgEl.src = dataUrl;
      document.querySelector('#print > div').appendChild(imgEl);

      printingNeedsUpdating = false;
    }
  }

  function _onBeforePrint(mediaMatch) {
    // So that max-height: 100% works
    if (mediaMatch) {
      document.querySelector('#print > div').style.width = window.innerWidth + 'px';
      document.querySelector('#print > div').style.height = window.innerHeight + 'px';
    }

    _updatePrintImage();

    if (!mediaMatch) {
      document.querySelector('#print > div > img').style.width = '100%';
    }
  }

  function _onAfterPrint() {

  }

  function _print(event) {
    _hideMenus();
    _infoBubble.hide();
    _infoBubble.hideSegment(true);

    window.setTimeout(function() {
      _onBeforePrint();
      window.print();
    }, 50);
    event.preventDefault();
  }

  function _addEventListeners() {
    window.addEventListener('beforeprint', function() { _onBeforePrint(false); } );
    window.addEventListener('afterprint', function() { _onAfterPrint(false); } );

    var mediaQueryList = window.matchMedia('print');
    mediaQueryList.addListener(function(mql) {
      if (mql.matches) {
        _onBeforePrint(true);
      } else {
        _onAfterPrint(true);
      }
    });    

    document.querySelector('#invoke-print').addEventListener('click', _print);

    document.querySelector('#share-via-twitter').addEventListener('click', _shareViaTwitter);
    document.querySelector('#share-via-facebook').addEventListener('click', _shareViaFacebook);

    if (system.touch) {
      document.querySelector('#dialog-box-shield').addEventListener('touchstart', _hideDialogBoxes);
    } else {
      document.querySelector('#dialog-box-shield').addEventListener('click', _hideDialogBoxes);
    }
    document.querySelector('#about .close').addEventListener('click', _hideAboutDialogBox);

    document.querySelector('#about-streetmix').addEventListener('click', _showAboutDialogBox);

    document.querySelector('#street-scroll-indicator-left').addEventListener('click', _onStreetLeftScrollClick);
    document.querySelector('#street-scroll-indicator-right').addEventListener('click', _onStreetRightScrollClick);

    if (system.touch) {
      document.querySelector('#welcome .close').addEventListener('touchstart', _hideWelcome);
    } else {
      document.querySelector('#welcome .close').addEventListener('click', _hideWelcome);      
    }
    document.querySelector('#save-as-image-dialog .close').addEventListener('click', _hideSaveAsImageDialogBox);      

    document.querySelector('#save-as-image').addEventListener('click', _showSaveAsImageDialogBox);

    document.querySelector('#save-as-image-transparent-sky').addEventListener('click', _updateSaveAsImageOptions);
    document.querySelector('#save-as-image-segment-names').addEventListener('click', _updateSaveAsImageOptions);
    document.querySelector('#save-as-image-street-name').addEventListener('click', _updateSaveAsImageOptions);

    document.querySelector('#street-section-outer').addEventListener('scroll', _onStreetSectionScroll);

    if (!system.touch) {
      $('#street-section-left-building').mouseenter(_onBuildingMouseEnter);
      $('#street-section-left-building').mouseleave(_onBuildingMouseLeave);
      $('#street-section-right-building').mouseenter(_onBuildingMouseEnter);
      $('#street-section-right-building').mouseleave(_onBuildingMouseLeave);
    } else {
      document.querySelector('#street-section-left-building').addEventListener('touchstart', _onBuildingMouseEnter);      
      document.querySelector('#street-section-right-building').addEventListener('touchstart', _onBuildingMouseEnter);      
    }

    if (!system.touch) {
      $('.info-bubble').mouseenter(_infoBubble.onMouseEnter);
      $('.info-bubble').mouseleave(_infoBubble.onMouseLeave);
    }
    document.querySelector('.info-bubble').addEventListener('touchstart', _infoBubble.onTouchStart);

    document.querySelector('#feedback-form-message').addEventListener('input', _onFeedbackFormInput);
    document.querySelector('#feedback-form-email').addEventListener('input', _onFeedbackFormInput);
    document.querySelector('#feedback-form-email').addEventListener('keydown', _onFeedbackFormEmailKeyDown);
    document.querySelector('#feedback-form-send').addEventListener('click', _feedbackFormSend);

    document.querySelector('#gallery-try-again').addEventListener('click', _repeatReceiveGalleryData);

    document.querySelector('#no-connection-try-again').addEventListener('click', _nonblockingAjaxTryAgain);

    document.querySelector('#blocking-shield-cancel').addEventListener('click', _blockingCancel);
    document.querySelector('#blocking-shield-try-again').addEventListener('click', _blockingTryAgain);
    document.querySelector('#blocking-shield-reload').addEventListener('click', _goReload);
    document.querySelector('#gallery-shield').addEventListener('click', _onGalleryShieldClick);

    document.querySelector('#new-street-default').addEventListener('click', _onNewStreetDefaultClick);
    document.querySelector('#new-street-empty').addEventListener('click', _onNewStreetEmptyClick);
    document.querySelector('#new-street-last').addEventListener('click', _onNewStreetLastClick);

    window.addEventListener('storage', _onStorageChange);

    if (system.touch) {
      document.querySelector('#gallery-link a').addEventListener('touchstart', _onMyStreetsClick);
    } else {
      document.querySelector('#gallery-link a').addEventListener('click', _onMyStreetsClick);      
    }

    document.querySelector('#sign-out-link').addEventListener('click', _onSignOutClick);

    /*if (system.pageVisibility) {
      document.addEventListener('visibilitychange', _onVisibilityChange, false);
      document.addEventListener('webkitvisibilitychange', _onVisibilityChange, false);
      document.addEventListener('mozvisibilitychange', _onVisibilityChange, false);
      document.addEventListener('msvisibilitychange', _onVisibilityChange, false);
    }*/
    window.addEventListener('focus', _onWindowFocus);
    window.addEventListener('blur', _onWindowBlur);

    window.addEventListener('beforeunload', _onWindowBeforeUnload);

    if (!readOnly) {
      if (system.touch) {
        document.querySelector('#street-name').addEventListener('touchstart', _askForStreetName);
      } else {
        document.querySelector('#street-name').addEventListener('click', _askForStreetName);      
      }
    }

    if (system.touch) {
      document.querySelector('#undo').addEventListener('touchstart', _undo);
      document.querySelector('#redo').addEventListener('touchstart', _redo);
    } else {
      document.querySelector('#undo').addEventListener('click', _undo);
      document.querySelector('#redo').addEventListener('click', _redo);      
    }

    if (!readOnly) {
      document.querySelector('#street-width-read').addEventListener('click', _onStreetWidthClick);

      document.querySelector('#street-width').
          addEventListener('change', _onStreetWidthChange);
    }

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
    window.addEventListener('keydown', _onGlobalKeyDown);  

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

  function _addBodyClasses() {
    document.body.classList.add('environment-{{env}}');

    if (system.windows) {
      document.body.classList.add('windows');
    }

    if (system.safari) {
      document.body.classList.add('safari');      
    }

    if (system.touch) {
      document.body.classList.add('touch-support');
    }

    if (readOnly) {
      document.body.classList.add('read-only');
    }

    if (system.phone) {
      document.body.classList.add('phone');
    }
  }

  function _detectSystemCapabilities() {

    // NOTE: 
    // This function might be called on very old browsers. Please make
    // sure not to use modern faculties.

    if (debug.forceTouch) {
      system.touch = true;
    } else {
      system.touch = Modernizr.touch;
    }
    system.pageVisibility = Modernizr.pagevisibility;
    if (debug.forceNonRetina) {
      system.hiDpi = 1.0;
    } else {
      system.hiDpi = window.devicePixelRatio || 1.0;      
    }

    if ((typeof matchMedia != 'undefined') && 
        matchMedia('only screen and (max-device-width: 480px)').matches) {
      system.phone = true;
    } else {
      system.phone = false;
    }

    system.cssTransform = false;
    var el = document.createElement('div');
    for (var i in CSS_TRANSFORMS) {
      if (typeof el.style[CSS_TRANSFORMS[i]] != 'undefined') {
        system.cssTransform = CSS_TRANSFORMS[i];
        break;
      }
    }

    if (navigator.userAgent.indexOf('Windows') != -1) {
      system.windows = true;
    }

    if ((navigator.userAgent.indexOf('Safari') != -1) && 
        (navigator.userAgent.indexOf('Chrome') == -1)) {
      system.safari = true;
    }

    if (system.phone || debug.forceReadOnly) {
      readOnly = true;
    }

    var meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    if (system.phone) {
      meta.setAttribute('content', 'initial-scale=.5, maximum-scale=.5');
    } else {
      meta.setAttribute('content', 'initial-scale=1, maximum-scale=1');      
    }
    var headEls = document.getElementsByTagName('head');
    headEls[0].appendChild(meta);

    var language = window.navigator.userLanguage || window.navigator.language;
    if (language) {
      var language = language.substr(0, 2).toUpperCase();
      _updateSettingsFromCountryCode(language);
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

  function _switchSegmentElIn(el) {
    el.classList.add('switching-in-pre');

    window.setTimeout(function() {
      var pos = _getElAbsolutePos(el);
      var perspective = -(pos[0] - document.querySelector('#street-section-outer').scrollLeft - system.viewportWidth / 2);
      // TODO const
      // TODO cross-browser

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
      _removeElFromDom(el);
    }, SEGMENT_SWITCHING_TIME);
  }

  var _eventTracking = {
    alreadyTracked: [],

    track: function(category, action, label, value, onlyFirstTime) {
      if (onlyFirstTime) {
        var id = category + '|' + action + '|' + label;

        if (_eventTracking.alreadyTracked[id]) {
          return;
        }
      }

      // console.log('Event tracked', category, action, label);

      _gaq && _gaq.push(['_trackEvent', category, action, label, value]);

      if (onlyFirstTime) {
        _eventTracking.alreadyTracked[id] = true;        
      }
    }
  }

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

      var bubbleX = _infoBubble.bubbleX;
      var bubbleY = _infoBubble.bubbleY;
      var bubbleWidth = _infoBubble.bubbleWidth;
      var bubbleHeight = _infoBubble.bubbleHeight;

      if (_infoBubble.descriptionVisible) {
        // TODO const
        var marginBubble = 200;
      } else {
        var marginBubble = INFO_BUBBLE_MARGIN_BUBBLE;
      }

      if (_infoBubble.mouseInside && !_infoBubble.descriptionVisible) {
        var pos = _getElAbsolutePos(_infoBubble.segmentEl);

        var x = pos[0] - document.querySelector('#street-section-outer').scrollLeft;

        var segmentX1 = x - INFO_BUBBLE_MARGIN_BUBBLE;
        var segmentX2 = x + _infoBubble.segmentEl.offsetWidth + INFO_BUBBLE_MARGIN_BUBBLE;

        var segmentY = pos[1] + _infoBubble.segmentEl.offsetHeight + INFO_BUBBLE_MARGIN_BUBBLE;

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
        var bottomY = mouseY - INFO_BUBBLE_MARGIN_MOUSE;
        if (bottomY < bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE) {
          bottomY = bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE;
        }
        var bottomY2 = mouseY + INFO_BUBBLE_MARGIN_MOUSE;
        if (bottomY2 < bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE) {
          bottomY2 = bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE;
        }

      if (_infoBubble.descriptionVisible) {
        bottomY = bubbleY + bubbleHeight + marginBubble;
        bottomY2 = bottomY;
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
          [(bubbleX - marginBubble + mouseX - INFO_BUBBLE_MARGIN_MOUSE - diffX) / 2, bottomY + (bubbleY + bubbleHeight + marginBubble - bottomY) * .2],
          [mouseX - INFO_BUBBLE_MARGIN_MOUSE - diffX, bottomY], 
          [mouseX - INFO_BUBBLE_MARGIN_MOUSE, bottomY2], 
          [mouseX + INFO_BUBBLE_MARGIN_MOUSE, bottomY2], 
          [mouseX + INFO_BUBBLE_MARGIN_MOUSE + diffX, bottomY],
          [(bubbleX + bubbleWidth + marginBubble + mouseX + INFO_BUBBLE_MARGIN_MOUSE + diffX) / 2, bottomY + (bubbleY + bubbleHeight + marginBubble - bottomY) * .2],
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
        _infoBubble.segmentEl.classList.remove('hide-drag-handles-when-inside-info-bubble');
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
        document.body.classList.remove('controls-fade-out'); 

        _infoBubble.el.classList.remove('visible');
        _infoBubble.visible = false;

        document.body.removeEventListener('mousemove', _infoBubble.onBodyMouseMove);
      }
    },

    considerShowing: function(event, segmentEl, type) {
      if (menuVisible || readOnly) {
        return;
      }

      if (event) {
        _infoBubble.considerMouseX = event.pageX;
        _infoBubble.considerMouseY = event.pageY;
      } else {
        var pos = _getElAbsolutePos(segmentEl);

        _infoBubble.considerMouseX = pos[0] - document.querySelector('#street-section-outer').scrollLeft;
        _infoBubble.considerMouseY = pos[1];
      }
      _infoBubble.considerSegmentEl = segmentEl;
      _infoBubble.considerType = type;

      if ((segmentEl == _infoBubble.segmentEl) && (type == _infoBubble.type)) {
        return;
      }

      if (!_infoBubble.visible || !_infoBubble._withinHoverPolygon(_infoBubble.considerMouseX, _infoBubble.considerMouseY)) {
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

    updateDescriptionInContents: function(segment) {
      if (!_infoBubble.segmentEl || !segment || !segment.el || 
          (_infoBubble.segmentEl != segment.el)) {
        return;
      }

      var segmentInfo = SEGMENT_INFO[segment.type];
      var variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString];

      _removeElFromDom(_infoBubble.el.querySelector('.description-prompt'));
      _removeElFromDom(_infoBubble.el.querySelector('.description-canvas'));

      var description = '';
      if (variantInfo && variantInfo.description) {
        var description = variantInfo.description;
        var descriptionPrompt = variantInfo.descriptionPrompt;
      } else if (segmentInfo && segmentInfo.description) {
        var description = segmentInfo.description;
        var descriptionPrompt = segmentInfo.descriptionPrompt;
      }

      if (description) {
        var el = document.createElement('div');
        el.classList.add('description-prompt');
        el.innerHTML = descriptionPrompt;
        if (system.touch) {
          el.addEventListener('touchstart', _infoBubble.showDescription);
        } else {
          el.addEventListener('click', _infoBubble.showDescription);
        }
        $(el).mouseenter(_infoBubble.highlightTriangle);
        $(el).mouseleave(_infoBubble.unhighlightTriangle);
        _infoBubble.el.appendChild(el);

        var el = document.createElement('div');
        el.classList.add('description-canvas');

        var innerEl = document.createElement('div');
        innerEl.classList.add('description');
        innerEl.innerHTML = description;
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

        var innerEl = document.createElement('div');
        innerEl.classList.add('triangle');
        el.appendChild(innerEl);

        _infoBubble.el.appendChild(el);                
      }      
    },

    updateWarningsInContents: function(segment) {
      if (!_infoBubble.segmentEl || !segment || !segment.el || 
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

    updateHeightButtonsInContents: function() {
      var height = (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) ? street.leftBuildingHeight : street.rightBuildingHeight;
      var variant = (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) ? street.leftBuildingVariant : street.rightBuildingVariant;

      if (!_isFlooredBuilding(variant) || (height == 1)) {
        _infoBubble.el.querySelector('.non-variant .decrement').disabled = true;        
      } else {
        _infoBubble.el.querySelector('.non-variant .decrement').disabled = false;                
      }

      if (!_isFlooredBuilding(variant) || (height == MAX_BUILDING_HEIGHT)) {
        _infoBubble.el.querySelector('.non-variant .increment').disabled = true;        
      } else {
        _infoBubble.el.querySelector('.non-variant .increment').disabled = false;                
      }
    },

    updateWidthButtonsInContents: function(width) {
      if (width == MIN_SEGMENT_WIDTH) {
        _infoBubble.el.querySelector('.non-variant .decrement').disabled = true;
      } else {
        _infoBubble.el.querySelector('.non-variant .decrement').disabled = false;        
      }

      if (width == MAX_SEGMENT_WIDTH) {
        _infoBubble.el.querySelector('.non-variant .increment').disabled = true;
      } else {
        _infoBubble.el.querySelector('.non-variant .increment').disabled = false;        
      }
    },

    updateHeightInContents: function(left) {
      if (!_infoBubble.visible || 
          (left && (_infoBubble.type != INFO_BUBBLE_TYPE_LEFT_BUILDING)) ||
          (!left && (_infoBubble.type != INFO_BUBBLE_TYPE_RIGHT_BUILDING))) {
        return;
      }

      var height = left ? street.leftBuildingHeight : street.rightBuildingHeight;
      var variant = left ? street.leftBuildingVariant : street.rightBuildingVariant;

      _infoBubble.updateHeightButtonsInContents();

      if (_isFlooredBuilding(variant)) {
        var el = _infoBubble.el.querySelector('.non-variant .height');
        if (el) {
          el.realValue = height;
          el.value = _prettifyHeight(height, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);
        } else {
          var el = _infoBubble.el.querySelector('.non-variant .height-non-editable');
          el.innerHTML = _prettifyHeight(height, PRETTIFY_WIDTH_OUTPUT_MARKUP);
        }
      }
    },

    updateWidthInContents: function(segmentEl, width) {
      if (!_infoBubble.visible || !_infoBubble.segmentEl || 
          (_infoBubble.segmentEl != segmentEl)) {
        return;
      }

      _infoBubble.updateWidthButtonsInContents(width);

      var el = _infoBubble.el.querySelector('.non-variant .width');
      if (el) {
        el.realValue = width;
        el.value = _prettifyWidth(width, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);
      } else {
        var el = _infoBubble.el.querySelector('.non-variant .width-non-editable');
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

      switch (_infoBubble.type) {
        case INFO_BUBBLE_TYPE_SEGMENT:
          var segment = street.segments[parseInt(_infoBubble.segmentEl.dataNo)];
          var segmentInfo = SEGMENT_INFO[segment.type];
          var variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString];
          var name = variantInfo.name || segmentInfo.name;

          //var name = segmentInfo.name;
          var canBeDeleted = true;
          var showWidth = true;
          var showVariants = true;

          _infoBubble.el.setAttribute('type', 'segment');
          break;
        case INFO_BUBBLE_TYPE_LEFT_BUILDING:
          var name = BUILDING_VARIANT_NAMES[BUILDING_VARIANTS.indexOf(street.leftBuildingVariant)];
          var canBeDeleted = false;
          var showWidth = false;
          var showVariants = false;

          _infoBubble.el.setAttribute('type', 'building');
          break;
        case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
          var name = BUILDING_VARIANT_NAMES[BUILDING_VARIANTS.indexOf(street.rightBuildingVariant)];
          var canBeDeleted = false;
          var showWidth = false;
          var showVariants = false;

          _infoBubble.el.setAttribute('type', 'building');
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
        innerEl.innerHTML = 'Remove';
        //_infoBubble.createVariantIcon('trashcan', innerEl);
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
        if (_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING) {
          var variant = street.leftBuildingVariant;
          var height = street.leftBuildingHeight;
        } else {
          var variant = street.rightBuildingVariant;
          var height = street.rightBuildingHeight;
        }

        var disabled = !_isFlooredBuilding(variant);

        var widthCanvasEl = document.createElement('div');
        widthCanvasEl.classList.add('non-variant');
        widthCanvasEl.classList.add('building-height');

        var innerEl = document.createElement('button');
        innerEl.classList.add('increment');
        innerEl.innerHTML = '+';
        innerEl.tabIndex = -1;
        innerEl.title = msg('TOOLTIP_ADD_FLOOR');
        var func = function() {
          _changeBuildingHeight(_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING, true);
        }
        if (system.touch) {
          innerEl.addEventListener('touchstart', func);
        } else {
          innerEl.addEventListener('click', func);        
        }
        widthCanvasEl.appendChild(innerEl);      
        if (!system.touch) {
          var innerEl = document.createElement('input');
          innerEl.setAttribute('type', 'text');
          innerEl.classList.add('height');
          innerEl.title = msg('TOOLTIP_BUILDING_HEIGHT');
          
          innerEl.addEventListener('click', _onWidthHeightEditClick);
          innerEl.addEventListener('focus', _onHeightEditFocus);
          innerEl.addEventListener('blur', _onHeightEditBlur);
          innerEl.addEventListener('input', _onHeightEditInput);
          innerEl.addEventListener('mouseover', _onWidthHeightEditMouseOver);
          innerEl.addEventListener('mouseout', _onWidthHeightEditMouseOut);
          innerEl.addEventListener('keydown', _onHeightEditKeyDown);
          
          //innerEl.addEventListener('mouseover', _showWidthChart);
          //innerEl.addEventListener('mouseout', _hideWidthChart);
        } else {
          var innerEl = document.createElement('span');
          innerEl.classList.add('height-non-editable');
        }
        if (disabled) {
          innerEl.disabled = true;
        }
        widthCanvasEl.appendChild(innerEl);        

        var innerEl = document.createElement('button');
        innerEl.classList.add('decrement');
        innerEl.innerHTML = '–';
        innerEl.tabIndex = -1;
        innerEl.title = msg('TOOLTIP_REMOVE_FLOOR');
        var func = function() {
          _changeBuildingHeight(_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING, false);
        }
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
        widthCanvasEl.classList.add('non-variant');

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
          innerEl.title = msg('TOOLTIP_SEGMENT_WIDTH');
          innerEl.segmentEl = segment.el;

          innerEl.addEventListener('click', _onWidthHeightEditClick);
          innerEl.addEventListener('focus', _onWidthEditFocus);
          innerEl.addEventListener('blur', _onWidthEditBlur);
          innerEl.addEventListener('input', _onWidthEditInput);
          innerEl.addEventListener('mouseover', _onWidthHeightEditMouseOver);
          innerEl.addEventListener('mouseout', _onWidthHeightEditMouseOut);
          innerEl.addEventListener('keydown', _onWidthEditKeyDown);

          //innerEl.addEventListener('mouseover', _showWidthChart);
          //innerEl.addEventListener('mouseout', _hideWidthChart);
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
                    _changeSegmentVariant(dataNo, variantName, variantChoice);
                  }
                })(segment.el.dataNo, variantName, variantChoice));
              } else {
                el.addEventListener('click', (function(dataNo, variantName, variantChoice) {
                  return function() {
                    _changeSegmentVariant(dataNo, variantName, variantChoice);
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

      _infoBubble.updateDescriptionInContents(segment);
      _infoBubble.updateWarningsInContents(segment);
      window.setTimeout(function() {
        if (_infoBubble.type == INFO_BUBBLE_TYPE_SEGMENT) {
          _infoBubble.updateWidthInContents(segment.el, segment.width);
        } else {
          _infoBubble.updateHeightInContents(_infoBubble.type == INFO_BUBBLE_TYPE_LEFT_BUILDING);
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
      el.style.height = (streetSectionTop + 200 + 50 - _infoBubble.bubbleY) + 'px';

      _infoBubble.el.classList.add('show-description');
      if (_infoBubble.segmentEl) {
        _infoBubble.segmentEl.classList.add('hide-drag-handles-when-description-shown');
      }
      _infoBubble.unhighlightTriangleDelayed();
      window.setTimeout(function() {
        _infoBubble.getBubbleDimensions();
        _infoBubble.updateHoverPolygon();
      }, 500);

      var segment = street.segments[parseInt(_infoBubble.segmentEl.dataNo)];
      _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_LEARN_MORE, 
          segment.type, null, false);
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
      if (bubbleX < 50) {
        bubbleX = 50;
      } else if (bubbleX > system.viewportWidth - bubbleWidth - 50) {
        bubbleX = system.viewportWidth - bubbleWidth - 50;
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
      el.innerHTML = msg('UI_GLYPH_X');
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

    // NOTE: 
    // This function might be called on very old browsers. Please make
    // sure not to use modern faculties.

    document.getElementById('loading').className += ' hidden';
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

      _prepareFeedbackForm();

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
    if (typeof settings.saveAsImageTransparentSky === 'undefined') {
      settings.saveAsImageTransparentSky = secondSettings.saveAsImageTransparentSky;
    }
    if (typeof settings.saveAsImageSegmentNamesAndWidths === 'undefined') {
      settings.saveAsImageSegmentNamesAndWidths = secondSettings.saveAsImageSegmentNamesAndWidths;
    }
    if (typeof settings.saveAsImageStreetName === 'undefined') {
      settings.saveAsImageStreetName = secondSettings.saveAsImageStreetName;
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
    if (typeof settings.saveAsImageTransparentSky === 'undefined') {
      settings.saveAsImageTransparentSky = false;
    }
    if (typeof settings.saveAsImageSegmentNamesAndWidths === 'undefined') {
      settings.saveAsImageSegmentNamesAndWidths = false;
    }
    if (typeof settings.saveAsImageStreetName === 'undefined') {
      settings.saveAsImageStreetName = false;
    }
  }

  function _loadSettingsWelcomeDismissed() {
    if (window.localStorage[LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED]) {
      settingsWelcomeDismissed = 
          JSON.parse(window.localStorage[LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED]);
    }
  }

  function _saveSettingsWelcomeDismissed() {
    window.localStorage[LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED] = 
        JSON.stringify(settingsWelcomeDismissed);
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
    data.saveAsImageTransparentSky = settings.saveAsImageTransparentSky;
    data.saveAsImageSegmentNamesAndWidths = settings.saveAsImageSegmentNamesAndWidths;
    data.saveAsImageStreetName = settings.saveAsImageStreetName;

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

        document.body.classList.add('units-imperial');

        break;
      case SETTINGS_UNITS_METRIC:
        segmentWidthResolution = SEGMENT_WIDTH_RESOLUTION_METRIC;
        segmentWidthClickIncrement = SEGMENT_WIDTH_CLICK_INCREMENT_METRIC;
        segmentWidthDraggingResolution = 
            SEGMENT_WIDTH_DRAGGING_RESOLUTION_METRIC;

        document.body.classList.add('units-metric');

        break;
    }

    _buildStreetWidthMenu();
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
    street.editCount = 0;
    //console.log('editCount = 0 on default street');
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
    street.editCount = 0;
    //console.log('editCount = 0 on empty street!');
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

        if (graphics.repeat && !$.isArray(graphics.repeat)) {
          graphics.repeat = [graphics.repeat];
        }
        if (graphics.left && !$.isArray(graphics.left)) {
          graphics.left = [graphics.left];
        }
        if (graphics.right && !$.isArray(graphics.right)) {
          graphics.right = [graphics.right];
        }
        if (graphics.center && !$.isArray(graphics.center)) {
          graphics.center = [graphics.center];
        }
      }
    }
  }

  function _scheduleNextLiveUpdateCheck() {
    window.setTimeout(_checkForLiveUpdate, LIVE_UPDATE_DELAY);
  }

  function _checkForLiveUpdate() {
    var url = _getFetchStreetUrl();

    $.ajax({
      url: url,
      dataType: 'json',
      type: 'HEAD'
    }).done(_receiveLiveUpdateCheck);
  }

  function _receiveLiveUpdateCheck(data, textStatus, jqXHR) {
    var newUpdatedDate = 
        Math.floor((new Date(jqXHR.getResponseHeader('last-modified')).getTime()) / 1000);
    var oldUpdatedDate = 
        Math.floor((new Date(street.updatedAt).getTime()) / 1000);

    if (newUpdatedDate != oldUpdatedDate) {
      var url = _getFetchStreetUrl();
      $.ajax({
        url: url,
        dataType: 'json',
        type: 'GET'
      }).done(_receiveLiveUpdateStreet);
    }

    _scheduleNextLiveUpdateCheck();
  }

  function _flash() {
    document.querySelector('#flash').classList.add('visible');

    window.setTimeout(function() {
      document.querySelector('#flash').classList.add('fading-out');
    }, 100);

    window.setTimeout(function() {
      document.querySelector('#flash').classList.remove('visible');
      document.querySelector('#flash').classList.remove('fading-out');
    }, 1000);
  }

  function _receiveLiveUpdateStreet(transmission) {
    window.setTimeout(function() {
      _unpackServerStreetData(transmission, null, null, false);
      _updateEverything(true);
    }, 1000);

    _flash();
  }

  function _onEverythingLoaded() {
    switch (mode) {
      case MODE_NEW_STREET_COPY_LAST:
        _onNewStreetLastClick();
        break;
    }
    _showWelcome();

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
    } else if (mode == MODE_ABOUT) {
      _showAboutDialogBox();
    }

    if (promoteStreet) {
      _remixStreet();
    }

    window.setTimeout(_hideLoadingScreen, 0);

    if (debug.forceLiveUpdate) {
      _scheduleNextLiveUpdateCheck();
    }
  }

  function _drawStreetThumbnail(ctx, street, thumbnailWidth, thumbnailHeight, 
                                multiplier, silhouette, bottomAligned,
                                transparentSky, segmentNamesAndWidths, streetName) {
    
    // Calculations

    var occupiedWidth = 0;
    for (var i in street.segments) {
      occupiedWidth += street.segments[i].width;
    }

    if (bottomAligned) {
      var offsetTop = thumbnailHeight - 180 * multiplier;
    } else {
      var offsetTop = (thumbnailHeight + 5 * TILE_SIZE * multiplier) / 2;
    }
    if (segmentNamesAndWidths) {
      offsetTop -= SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING * multiplier;
    }

    var offsetLeft = (thumbnailWidth - occupiedWidth * TILE_SIZE * multiplier) / 2;
    var buildingOffsetLeft = (thumbnailWidth - street.width * TILE_SIZE * multiplier) / 2;

    var groundLevel = offsetTop + 135 * multiplier;

    // Sky

    if (!transparentSky) {
      ctx.fillStyle = SKY_COLOUR;
      ctx.fillRect(0, 0, thumbnailWidth * system.hiDpi, (groundLevel + 20 * multiplier) * system.hiDpi);

      var y = groundLevel - 280;

      for (var i = 0; i < Math.floor(thumbnailWidth / SKY_WIDTH) + 1; i++) {
        ctx.drawImage(images['/images/sky-front.png'],
            0, 0, SKY_WIDTH * 2, 280 * 2,
            i * SKY_WIDTH * system.hiDpi, y * system.hiDpi, SKY_WIDTH * system.hiDpi, 280 * system.hiDpi);
      }

      var y = groundLevel - 280 - 120;

      for (var i = 0; i < Math.floor(thumbnailWidth / SKY_WIDTH) + 1; i++) {
        ctx.drawImage(images['/images/sky-rear.png'],
            0, 0, SKY_WIDTH * 2, 120 * 2,
            i * SKY_WIDTH * system.hiDpi, y * system.hiDpi, SKY_WIDTH * system.hiDpi, 120 * system.hiDpi);
      }
    }

    // Dirt    

    ctx.fillStyle = BACKGROUND_DIRT_COLOUR;
    ctx.fillRect(0, (groundLevel + 20 * multiplier) * system.hiDpi, 
      thumbnailWidth * system.hiDpi, (25 * multiplier) * system.hiDpi);
    
    ctx.fillRect(0, groundLevel * system.hiDpi,
                 (thumbnailWidth / 2 - street.width * TILE_SIZE * multiplier / 2) * system.hiDpi, 
                 (20 * multiplier) * system.hiDpi);

    ctx.fillRect((thumbnailWidth / 2 + street.width * TILE_SIZE * multiplier / 2) * system.hiDpi, 
                 groundLevel * system.hiDpi,
                 thumbnailWidth * system.hiDpi,
                 (20 * multiplier) * system.hiDpi);

    // Segment names

    ctx.fillStyle = BOTTOM_BACKGROUND;
    ctx.fillRect(0, (groundLevel + 45 * multiplier) * system.hiDpi, 
      thumbnailWidth * system.hiDpi, (thumbnailHeight - groundLevel - 45 * multiplier) * system.hiDpi);

    // Buildings

    var buildingWidth = buildingOffsetLeft / multiplier;

    var x = thumbnailWidth / 2 - street.width * TILE_SIZE * multiplier / 2;
    _drawBuilding(ctx, BUILDING_DESTINATION_THUMBNAIL, street, true, buildingWidth, groundLevel + 45, true, x - (buildingWidth - 25) * multiplier, 0, multiplier);

    var x = thumbnailWidth / 2 + street.width * TILE_SIZE * multiplier / 2;
    _drawBuilding(ctx, BUILDING_DESTINATION_THUMBNAIL, street, false, buildingWidth, groundLevel + 45, true, x - 25 * multiplier, 0, multiplier);

    // Segments

    var originalOffsetLeft = offsetLeft;

    // Collect z-indexes
    var zIndexes = [];
    for (var i in street.segments) {
      var segment = street.segments[i];
      var segmentInfo = SEGMENT_INFO[segment.type];

      if (zIndexes.indexOf(segmentInfo.zIndex) == -1) {
        zIndexes.push(segmentInfo.zIndex);
      }
    }

    for (var j in zIndexes) {
      var zIndex = zIndexes[j];

      offsetLeft = originalOffsetLeft;

      for (var i in street.segments) {
        var segment = street.segments[i];
        var segmentInfo = SEGMENT_INFO[segment.type];

        if (segmentInfo.zIndex == zIndex) {
          var variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString];
          var dimensions = _getVariantInfoDimensions(variantInfo, segment.width * TILE_SIZE, 1);

          _drawSegmentContents(ctx, segment.type, segment.variantString, 
              segment.width * TILE_SIZE * multiplier, 
              offsetLeft + dimensions.left * TILE_SIZE * multiplier, offsetTop, segment.randSeed, multiplier, false);
        }

        offsetLeft += segment.width * TILE_SIZE * multiplier;
      }    
    }


    // Segment names

    var offsetLeft = originalOffsetLeft;

    if (segmentNamesAndWidths) {
      ctx.save();

      // TODO const
      ctx.strokeStyle = 'black';
      ctx.lineWidth = .5;
      ctx.font = 'normal 300 26px Lato';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      for (var i = 0; i < street.segments.length; i++) {
        var segment = street.segments[i];

        var segmentInfo = SEGMENT_INFO[segment.type];
        var variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString];
        var name = variantInfo.name || segmentInfo.name;

        var left = offsetLeft;
        var availableWidth = segment.width * TILE_SIZE * multiplier;

        if (i == 0) {
          left--;
        }

        _drawLine(ctx, 
            left, (groundLevel + 45 * multiplier), 
            left, (groundLevel + 125 * multiplier));

        var x = (offsetLeft + availableWidth / 2) * system.hiDpi;

        var text = _prettifyWidth(segment.width, PRETTIFY_WIDTH_OUTPUT_NO_MARKUP);
        var width = ctx.measureText(text).width / 2;
        while ((width > availableWidth - 10 * multiplier) && (text.indexOf(' ') != -1)) {
          text = text.substr(0, text.lastIndexOf(' '));
          width = ctx.measureText(text).width / 2;
        }
        ctx.fillText(text, x, 
          (groundLevel + 60 * multiplier) * system.hiDpi);

        var width = ctx.measureText(name).width / 2;
        if (width <= availableWidth - 10 * multiplier) {
          ctx.fillText(name, x, 
            (groundLevel + 83 * multiplier) * system.hiDpi);          
        }

        // grid
        /*for (var j = 1; j < Math.floor(availableWidth / TILE_SIZE); j++) {
          _drawLine(ctx, 
              left + j * TILE_SIZE, (groundLevel + 45 * multiplier), 
              left + j * TILE_SIZE, (groundLevel + 55 * multiplier));          
        }*/

        offsetLeft += availableWidth;
      }    

      var left = offsetLeft + 1;
      _drawLine(ctx, 
          left, (groundLevel + 45 * multiplier), 
          left, (groundLevel + 125 * multiplier));

      ctx.restore();
    }

    // Silhouette

    if (silhouette) {
      ctx.globalCompositeOperation = 'source-atop';
      // TODO const
      ctx.fillStyle = 'rgb(240, 240, 240)';
      ctx.fillRect(0, 0, thumbnailWidth * system.hiDpi, thumbnailHeight * system.hiDpi);
    }

    // Street name

    if (streetName) {
      var text = street.name;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'center';

      if (_streetNameNeedsUnicodeFont(text)) {
        var fallbackUnicodeFont = true;
        ctx.font = 'normal 400 140px sans-serif';
      } else {
        var fallbackUnicodeFont = false;
        ctx.font = 'normal 400 160px Roadgeek';
      }

      var measurement = ctx.measureText(text);

      var needToBeElided = false;
      while (measurement.width > (thumbnailWidth - 200) * system.hiDpi) {
        text = text.substr(0, text.length - 1);
        measurement = ctx.measureText(text);        
        needToBeElided = true;
      }
      if (needToBeElided) {
        text += '…';
      }
      
      ctx.fillStyle = 'white';
      var x1 = thumbnailWidth * system.hiDpi / 2 - (measurement.width / 2 + 75 * system.hiDpi);
      var x2 = thumbnailWidth * system.hiDpi / 2 + (measurement.width / 2 + 75 * system.hiDpi);
      var y1 = (75 - 60) * system.hiDpi; 
      var y2 = (75 + 60) * system.hiDpi; 
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 10;
      ctx.strokeRect(x1 + 10 * 2, y1 + 10 * 2, x2 - x1 - 10 * 4, y2 - y1 - 10 * 4);

      var x = thumbnailWidth * system.hiDpi / 2;

      if (fallbackUnicodeFont) {
        var baselineCorrection = 24;
      } else {
        var baselineCorrection = 27;
      }

      var y = (75 + baselineCorrection) * system.hiDpi;

      ctx.strokeStyle = 'transparent';
      ctx.fillStyle = 'black';
      ctx.fillText(text, x, y);
    }
  }

  function _checkIfEverythingIsLoaded() {
    if (abortEverything) {
      return;
    }

    if ((imagesToBeLoaded == 0) && signInLoaded && bodyLoaded && 
        readyStateCompleteLoaded && geolocationLoaded && serverContacted) {
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
    $.ajax({
      url: API_URL + 'v1/users/' + signInData.userId,
      dataType: 'json',
      headers: { 'Authorization': _getAuthHeader() }
    }).done(_receiveSignInDetails).fail(_errorReceiveSignInDetails);
  }

  function _receiveSignInDetails(details) {
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

    /*if (data.status == 0) {
      _showError(ERROR_NEW_STREET_SERVER_FAILURE, true);
      return;
    }*/

    if (data.status == 401) {
      _eventTracking.track(TRACK_CATEGORY_ERROR, TRACK_ACTION_ERROR_RM1, 
          null, null, false);

      _signOut(true);

      _showError(ERROR_SIGN_IN_401, true);
      return;
    } else if (data.status == 503) {
      _eventTracking.track(TRACK_CATEGORY_ERROR, TRACK_ACTION_ERROR_15A, 
          null, null, false);

      _showError(ERROR_SIGN_IN_SERVER_FAILURE, true);
      return;
    }

    // Fail silently

    signInData = null;
    signedIn = false;
    _signInLoaded();
  }

  function _onSignOutClick(event) {
    _signOut(false);

    if (event) {
      event.preventDefault();
    }
  }  

  function _signOut(quiet) {
    settings.lastStreetId = null;
    settings.lastStreetNamespacedId = null;
    settings.lastStreetCreatorId = null;
    _saveSettingsLocally();

    _removeSignInCookies();
    window.localStorage.removeItem(LOCAL_STORAGE_SIGN_IN_ID);
    _sendSignOutToServer(quiet);
  }

  var uniqueRequestId = 0;

  function _getUniqueRequestHeader() {
    uniqueRequestId++;
    return uniqueRequestId;
  }

  function _getAuthHeader() {
    if (signInData && signInData.token) {
      return 'Streetmix realm="" loginToken="' + signInData.token + '"'
    } else {
      return '';
    }
  }

  function _sendSignOutToServer(quiet) {
    var call = {
      // TODO const
      url: API_URL + 'v1/users/' + signInData.userId + '/login-token',
      dataType: 'json',
      type: 'DELETE',
      headers: { 'Authorization': _getAuthHeader() }
    };

    if (quiet) {
      $.ajax(call);
    } else {
      $.ajax(call).done(_receiveSignOutConfirmationFromServer)
          .fail(_errorReceiveSignOutConfirmationFromServer);
    }
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
        (mode == MODE_ABOUT) ||
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
      case MODE_EXISTING_STREET:
      case MODE_CONTINUE:
      case MODE_USER_GALLERY:
      case MODE_ABOUT:
      case MODE_GLOBAL_GALLERY:
        _fetchStreetFromServer();
        break;
    }

    if (signedIn) {
      document.querySelector('#gallery-link a').href = '/' + signInData.userId;
    }

    signInLoaded = true;
    document.querySelector('#loading-progress').value++;
    _checkIfSignInAndGeolocationLoaded();
    _checkIfEverythingIsLoaded();
  }

  function _checkIfSignInAndGeolocationLoaded() {
    if (geolocationLoaded && signInLoaded) {
      switch (mode) {
        case MODE_NEW_STREET:
        case MODE_NEW_STREET_COPY_LAST:
          if (readOnly) {
            _showError(ERROR_CANNOT_CREATE_NEW_STREET_ON_PHONE, true);
          } else {
            _createNewStreetOnServer();
          }
          break;      
      }
    }
  }

  function _detectGeolocation() {
    geolocationLoaded = false;

    $.ajax({ url: IP_GEOLOCATION_API_URL }).done(_receiveGeolocation);

    window.setTimeout(_detectGeolocationTimeout, IP_GEOLOCATION_TIMEOUT);
  }

  function _detectGeolocationTimeout() {
    if (!geolocationLoaded) {
      geolocationLoaded = true;
      document.querySelector('#loading-progress').value++;      
      _checkIfSignInAndGeolocationLoaded();
      _checkIfEverythingIsLoaded();

      _eventTracking.track(TRACK_CATEGORY_ERROR, TRACK_ACTION_ERROR_GEOLOCATION_TIMEOUT, 
          null, null, false);
    }
  }

  function _updateSettingsFromCountryCode(countryCode) {
    if (COUNTRIES_IMPERIAL_UNITS.indexOf(countryCode) != -1) {
      units = SETTINGS_UNITS_IMPERIAL;
    } else {
      units = SETTINGS_UNITS_METRIC;
    }

    if (COUNTRIES_LEFT_HAND_TRAFFIC.indexOf(countryCode) != -1) {
      leftHandTraffic = true;
    }

    if (debug.forceLeftHandTraffic) {
      leftHandTraffic = true;
    }
    if (debug.forceMetric) {
      units = SETTINGS_UNITS_METRIC;
    }
  }

  function _receiveGeolocation(info) {
    if (geolocationLoaded) {
      // Timed out, discard results
      return;
    }

    if (info && info.country_code) {
      _updateSettingsFromCountryCode(info.country_code);
    }
    if (info && info.ip) {
      system.ipAddress = info.ip;
    }

    geolocationLoaded = true;
    document.querySelector('#loading-progress').value++;
    _checkIfSignInAndGeolocationLoaded();
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

    // TODO better
    if (url.match(/[\?\&]debug-canvas-rectangles\&?/)) {
      debug.canvasRectangles = true;
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

    if (url.match(/[\?\&]debug-force-non-retina\&?/)) {
      debug.forceNonRetina = true;
    }

    if (url.match(/[\?\&]debug-secret-segments\&?/)) {
      debug.secretSegments = true;
    }

    if (url.match(/[\?\&]debug-hover-polygon\&?/)) {
      debug.hoverPolygon = true;
    }

    if (url.match(/[\?\&]debug-force-read-only\&?/)) {
      debug.forceReadOnly = true;
    }

    if (url.match(/[\?\&]debug-force-touch\&?/)) {
      debug.forceTouch = true;
    }

    if (url.match(/[\?\&]debug-force-live-update\&?/)) {
      debug.forceLiveUpdate = true;
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
    } else if ((urlParts.length == 2) && (urlParts[0] == URL_HELP) && (urlParts[1] == URL_ABOUT)) {
      // About

      mode = MODE_ABOUT;
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
    }
  }

  function _createNewStreetOnServer() {
    if (settings.newStreetPreference == NEW_STREET_EMPTY) {
      _prepareEmptyStreet();
    } else {
      _prepareDefaultStreet();
    }

    var transmission = _packServerStreetData();  

    $.ajax({
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
    _setStreetId(data.id, data.namespacedId);

    _saveStreetToServer(true);
  }

  function _errorReceiveNewStreet(data) {
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

    $.ajax({
      url: url,
      dataType: 'json',
      type: 'GET'
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

    // NOTE: 
    // This function might be called on very old browsers. Please make
    // sure not to use modern faculties.

    if (typeof document.querySelectorAll == 'undefined') {
      return;
    }

    var els = document.querySelectorAll('.avatar:not([loaded])');

    for (var i = 0, el; el = els[i]; i++) {
      var userId = el.getAttribute('userId');
      var postpone = el.getAttribute('postpone');

      if (userId && !postpone && (typeof avatarCache[userId] == 'undefined')) {
        _fetchAvatar(userId);
      }
    }

    _updateAvatars();
  }

  function _fetchAvatar(userId) {
    avatarCache[userId] = null;
  
    $.ajax({
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
        (mode == MODE_ABOUT) || (mode == MODE_GLOBAL_GALLERY)) {
      _goNewStreet();
    } else {
      if ((data.status == 404) || (data.status == 410)) {
        if (street.creatorId) {
          if (data.status == 410) {
            mode = MODE_STREET_410_BUT_LINK_TO_USER;
          } else {
            mode = MODE_STREET_404_BUT_LINK_TO_USER;            
          }
        } else {
          mode = MODE_STREET_404;
        }
        // TODO swap for showError (here and elsewhere)
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

  function _goNewStreet(sameWindow) {
    if (sameWindow) {
      location.replace('/' + URL_NEW_STREET);
    } else {
      location.href = '/' + URL_NEW_STREET;
    }
  }

  function _goExampleStreet() {
    location.href = '/' + URL_EXAMPLE_STREET;
  }

  function _goCopyLastStreet() {
    location.href = '/' + URL_NEW_STREET_COPY_LAST;
  }

  function _showError(errorType, newAbortEverything) {

    // NOTE: 
    // This function might be called on very old browsers. Please make
    // sure not to use modern faculties.

    var title;
    var description = '';

    _hideLoadingScreen();

    abortEverything = newAbortEverything;

    switch (errorType) {
      case ERROR_404:
        title = 'Page not found.';
        description = 'Oh, boy. There is no page with this address!<br><button id="error-home">Go to the homepage</button>';
        break;
      case ERROR_STREET_404:
        title = 'Street not found.';
        description = 'Oh, boy. There is no street with this link!<br><button id="error-home">Go to the homepage</button>';
        break;
      case ERROR_STREET_404_BUT_LINK_TO_USER:
        title = 'Street not found.';
        description = 
            'There is no street with this link! But you can look at other streets by ' +
            '<a href="/' + street.creatorId + '"><div class="avatar" userId="' + street.creatorId + '"></div>' + street.creatorId + '</a>.' +
            '<br><button id="error-home">Go to the homepage</button>';
        break;
      case ERROR_STREET_410_BUT_LINK_TO_USER:
        title = 'This street has been deleted.';
        description = 'There is no longer a street with this link, but you can look at other streets by ' +
            '<a href="/' + street.creatorId + '"><div class="avatar" userId="' + street.creatorId + '"></div>' + street.creatorId + '</a>.' +
            '<br><button id="error-home">Go to the homepage</button>';
        break;
      case ERROR_SIGN_OUT:
        title = 'You are now signed out.';
        description = '<button id="error-sign-in">Sign in again</button> <button id="error-home">Go to the homepage</button>';
        break;
      case ERROR_NO_STREET:
        title = 'No street selected.';
        break;
      case ERROR_FORCE_RELOAD_SIGN_OUT:
        title = 'You signed out in another window.';
        description = 'Please reload this page before continuing.<br><button id="error-reload">Reload the page</button>';
        break;
      case ERROR_FORCE_RELOAD_SIGN_OUT_401:
        title = 'You signed out in another window.';
        description = 'Please reload this page before continuing.<br>(Error RM2.)<br><button id="error-clear-sign-in-reload">Reload the page</button>';
        break;
      case ERROR_FORCE_RELOAD_SIGN_IN:
        title = 'You signed in in another window.';
        description = 'Please reload this page before continuing.<br><button id="error-reload">Reload the page</button>';
        break;
      case ERROR_STREET_DELETED_ELSEWHERE:
        title = 'This street has been deleted elsewhere.';
        description = 'This street has been deleted in another browser.<br><button id="error-home">Go to the homepage</button>';
        break;
      case ERROR_NEW_STREET_SERVER_FAILURE:
        title = 'Having trouble…';
        description = 'We’re having trouble loading Streetmix.<br><button id="error-new">Try again</button>';
        break;
      case ERROR_SIGN_IN_SERVER_FAILURE:
        title = 'Having trouble…';
        description = 'We’re having trouble loading Streetmix.<br>(Error 15A.)<br><button id="error-new">Try again</button>';
        break;
      case ERROR_SIGN_IN_401:
        title = 'Having trouble…';
        description = 'We’re having trouble loading Streetmix.<br>(Error RM1.)<br><button id="error-new">Try again</button>';
        break;
      case ERROR_TWITTER_ACCESS_DENIED:
        title = 'You are not signed in.';
        description = 'You cancelled the Twitter sign in process.<br><button id="error-home">Go to the homepage</button>';
        break;
      case ERROR_AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN:
      case ERROR_AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN:
      case ERROR_AUTH_PROBLEM_API_PROBLEM:
        title = 'There was a problem with signing you in.';
        // TODO const for feedback
        description = 'There was a problem with Twitter authentication. Please try again later or let us know via <a target="_blank" href="mailto:streetmix@codeforamerica.org">email</a> or <a target="_blank" href="https://twitter.com/intent/tweet?text=@streetmixapp">Twitter</a>.<br><button id="error-home">Go to the homepage</button>';
        break;
      case ERROR_UNSUPPORTED_BROWSER:
        title = 'Streetmix doesn’t work on your browser… yet.';
        // TODO const for feedback
        description = 'Sorry about that. You might want to try <a target="_blank" href="http://www.google.com/chrome">Chrome</a>, <a target="_blank" href="http://www.mozilla.org/firefox">Firefox</a>, or Safari. If you think your browser should be supported, let us know via <a target="_blank" href="mailto:streetmix@codeforamerica.org">email</a> or <a target="_blank" href="https://twitter.com/intent/tweet?text=@streetmixapp">Twitter</a>.';
        break;      
      case ERROR_CANNOT_CREATE_NEW_STREET_ON_PHONE:
        title = 'Streetmix works on tablets and desktops only.';
        description = 'If you follow another link to a specific street, you can view it on your phone – but you cannot yet create new streets.<br><button id="error-example">View an example street</button>';
        break;  
      default: // also ERROR_GENERIC_ERROR
        title = 'Something went wrong.';
        // TODO const for feedback
        description = 'We’re sorry – something went wrong. Please try again later or let us know via <a target="_blank" href="mailto:streetmix@codeforamerica.org">email</a> or <a target="_blank" href="https://twitter.com/intent/tweet?text=@streetmixapp">Twitter</a>.<br><button id="error-home">Go to the homepage</button>';
        break;
    }

    if (abortEverything) {
      // Opera
      _removeElFromDom(document.getElementById('gallery'));
    }

    if (navigator.userAgent.indexOf('MSIE 6.') != -1) {
      document.body.style.display = 'none';
      alert('Streetmix doesn’t work on your browser. Please update to a newer browser such as Chrome, Firefox, or Safari.');
      return;
    }

    document.getElementById('error-title').innerHTML = title;
    document.getElementById('error-description').innerHTML = description;

    var el = document.getElementById('error-home');
    if (el) {
      el.addEventListener('click', _goHome);
    }

    var el = document.getElementById('error-sign-in');
    if (el) {
      el.addEventListener('click', _goSignIn);
    }

    var el = document.getElementById('error-reload');
    if (el) {
      el && el.addEventListener('click', _goReload);
    }

    var el = document.getElementById('error-clear-sign-in-reload');
    if (el) {
      el.addEventListener('click', _goReloadClearSignIn);
    }

    var el = document.getElementById('error-new');
    if (el) {
      el.addEventListener('click', _goNewStreet);
    }

    var el = document.getElementById('error-example');
    if (el) {
      el.addEventListener('click', _goExampleStreet);
    }

    document.getElementById('error').className += ' visible';

    _fetchAvatars();

    currentErrorType = errorType;
  }

  function _hideError() {
    document.querySelector('#error').classList.remove('visible');    

    currentErrorType = null;
  }

  function _showErrorFromUrl() {
    // TODO const
    switch (errorUrl) {
      case URL_ERROR_TWITTER_ACCESS_DENIED:
        var errorType = ERROR_TWITTER_ACCESS_DENIED;
        break;
      case URL_ERROR_NO_TWITTER_REQUEST_TOKEN:
        var errorType = ERROR_AUTH_PROBLEM_NO_TWITTER_REQUEST_TOKEN;
        break;
      case URL_ERROR_NO_TWITTER_ACCESS_TOKEN:
        var errorType = ERROR_AUTH_PROBLEM_NO_TWITTER_ACCESS_TOKEN;
        break;
      case URL_ERROR_AUTHENTICATION_API_PROBLEM:
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
      case MODE_STREET_404:
        _showError(ERROR_STREET_404, true);
        break;
      case MODE_STREET_404_BUT_LINK_TO_USER:
        _showError(ERROR_STREET_404_BUT_LINK_TO_USER, true);
        break;
      case MODE_STREET_410_BUT_LINK_TO_USER:
        _showError(ERROR_STREET_410_BUT_LINK_TO_USER, true);
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
      case MODE_ABOUT:
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

    $('#trashcan').text(msg('DRAG_HERE_TO_REMOVE'));

    $('#gallery .loading').text(msg('LOADING'));
    $('#loading > div > span').text(msg('LOADING'));

    $('#new-street').text(msg('BUTTON_NEW_STREET'));
    $('#copy-last-street').text(msg('BUTTON_COPY_LAST_STREET'));

    $('#street-width-read').attr('title', msg('TOOLTIP_STREET_WIDTH'));

    document.querySelector('#new-street').href = URL_NEW_STREET;
    document.querySelector('#copy-last-street').href = URL_NEW_STREET_COPY_LAST;

    _fillEmptySegments();
  }

  main.preInit = function() {
    initializing = true;
    ignoreStreetChanges = true;

    _detectDebugUrl();
    _detectSystemCapabilities();
  }
 
  main.init = function() {
    if (!debug.forceUnsupportedBrowser) {

      // TODO temporary ban
      if ((navigator.userAgent.indexOf('Opera') != -1) || 
          (navigator.userAgent.indexOf('Internet Explorer') != -1) ||
          (navigator.userAgent.indexOf('MSIE') != -1)) {
        mode = MODE_UNSUPPORTED_BROWSER;
        _processMode();
        return;
      }    
    }

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

    _addBodyClasses();
    _processUrl();
    _processMode();

    if (abortEverything) {
      return;
    }

    // Asynchronously loading…

    // …detecting country from IP for units and left/right-hand driving
    if ((mode == MODE_NEW_STREET) || (mode == MODE_NEW_STREET_COPY_LAST)) {
      _detectGeolocation();
    } else {
      geolocationLoaded = true;
    }

    // …sign in info from our API (if not previously cached) – and subsequent
    // street data if necessary (depending on the mode)
    _loadSignIn();

    // …images
    _loadImages();

    // Note that we are waiting for sign in and image info to show the page,
    // but we give up on country info if it’s more than 1000ms.
  }

  // FIXME? Is this the best way to expose this value? 
  main.GOOGLE_ANALYTICS_ACCOUNT = GOOGLE_ANALYTICS_ACCOUNT;

  return main;
})();
