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