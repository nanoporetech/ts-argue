export const ESC = '\u001b[';

export const MODIFIERS = {
  reset: '0',

  low_intensity: '2', // dim
  normal_intensity: '22', // not dim/bold
  high_intensity: '1', // bold

  underline: '4',
  no_underline: '24',

  blink: '5',
  no_blink: '25',

  reverse: '7',
  no_reverse: '27',

  strikethrough: '9',
  no_strikethrough: '29',
};

export const FONT_COLORS = {
  black: '30',
  red: '31',
  green: '32',
  yellow: '33',
  blue: '34',
  magenta: '35',
  cyan: '36',
  white: '37',
  default: '39',
  bright_black: '90',
  bright_red: '91',
  bright_green: '92',
  bright_yellow: '93',
  bright_blue: '94',
  bright_magenta: '95',
  bright_cyan: '96',
  bright_white: '97',
};

export const BACKGROUND_COLORS = {
  black: '40',
  red: '41',
  green: '42',
  yellow: '43',
  blue: '44',
  magenta: '45',
  cyan: '46',
  white: '47',
  default: '49',
  bright_black: '100',
  bright_red: '101',
  bright_green: '102',
  bright_yellow: '103',
  bright_blue: '104',
  bright_magenta: '105',
  bright_cyan: '106',
  bright_white: '107',
};

export const PUSH_CODES = new Map([
  [MODIFIERS.low_intensity, MODIFIERS.normal_intensity],
  [MODIFIERS.high_intensity, MODIFIERS.normal_intensity],
  [MODIFIERS.blink, MODIFIERS.no_blink],
  [MODIFIERS.reverse, MODIFIERS.no_reverse],
  [MODIFIERS.strikethrough, MODIFIERS.no_strikethrough],
  [MODIFIERS.underline, MODIFIERS.no_underline],

  [FONT_COLORS.black, FONT_COLORS.default],
  [FONT_COLORS.red, FONT_COLORS.default],
  [FONT_COLORS.green, FONT_COLORS.default],
  [FONT_COLORS.yellow, FONT_COLORS.default],
  [FONT_COLORS.blue, FONT_COLORS.default],
  [FONT_COLORS.magenta, FONT_COLORS.default],
  [FONT_COLORS.cyan, FONT_COLORS.default],
  [FONT_COLORS.white, FONT_COLORS.default],
  [FONT_COLORS.bright_black, FONT_COLORS.default],
  [FONT_COLORS.bright_red, FONT_COLORS.default],
  [FONT_COLORS.bright_green, FONT_COLORS.default],
  [FONT_COLORS.bright_yellow, FONT_COLORS.default],
  [FONT_COLORS.bright_blue, FONT_COLORS.default],
  [FONT_COLORS.bright_magenta, FONT_COLORS.default],
  [FONT_COLORS.bright_cyan, FONT_COLORS.default],
  [FONT_COLORS.bright_white, FONT_COLORS.default],

  [BACKGROUND_COLORS.black, BACKGROUND_COLORS.default],
  [BACKGROUND_COLORS.red, BACKGROUND_COLORS.default],
  [BACKGROUND_COLORS.green, BACKGROUND_COLORS.default],
  [BACKGROUND_COLORS.yellow, BACKGROUND_COLORS.default],
  [BACKGROUND_COLORS.blue, BACKGROUND_COLORS.default],
  [BACKGROUND_COLORS.magenta, BACKGROUND_COLORS.default],
  [BACKGROUND_COLORS.cyan, BACKGROUND_COLORS.default],
  [BACKGROUND_COLORS.white, BACKGROUND_COLORS.default],
  [BACKGROUND_COLORS.bright_black, BACKGROUND_COLORS.default],
  [BACKGROUND_COLORS.bright_red, BACKGROUND_COLORS.default],
  [BACKGROUND_COLORS.bright_green, BACKGROUND_COLORS.default],
  [BACKGROUND_COLORS.bright_yellow, BACKGROUND_COLORS.default],
  [BACKGROUND_COLORS.bright_blue, BACKGROUND_COLORS.default],
  [BACKGROUND_COLORS.bright_magenta, BACKGROUND_COLORS.default],
  [BACKGROUND_COLORS.bright_cyan, BACKGROUND_COLORS.default],
  [BACKGROUND_COLORS.bright_white, BACKGROUND_COLORS.default],
]);

export const POP_CODES = new Set([
  MODIFIERS.normal_intensity,
  MODIFIERS.no_blink,
  MODIFIERS.no_reverse,
  MODIFIERS.no_strikethrough,
  MODIFIERS.no_underline,
  FONT_COLORS.default,
  BACKGROUND_COLORS.default,
]);