const ESC = '\u001b[';

export const Modifiers = {
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

export const FontColors = {
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
export const BackgroundColors = {
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

export type Color = keyof typeof FontColors; // same colors available for Font vs Background
export type Modifier = keyof typeof Modifiers;
export type StyleTag = (_template: TemplateStringsArray | string, ..._values: string[]) => string; 

export function style (pre: string, post: string): StyleTag {
	const prefix = ESC + pre + 'm';
	const postfix = ESC + post + 'm';
	return (template, values) => {
		if (typeof template === 'string') {
			return prefix + template + postfix;
		}
		const results = [];
		
		results.push(prefix);
		let i = 0;
		for (let l = template.length - 1; i < l; i += 1) {
			results.push(template[i], values[i], prefix);
		}
		results.push(template[i], postfix);
		return results.join('');
	};
}

export const dim = style(Modifiers.low_intensity, Modifiers.normal_intensity);
export const bold = style(Modifiers.high_intensity, Modifiers.normal_intensity);
export const underline = style(Modifiers.underline, Modifiers.no_underline);
export const blink = style(Modifiers.blink, Modifiers.no_blink);
export const reverse = style(Modifiers.reverse, Modifiers.no_reverse);
export const strikethrough = style(Modifiers.strikethrough, Modifiers.no_strikethrough);

export const font_color = Object.fromEntries(Object.entries(FontColors).map(([name, code]): [string, StyleTag] => 
	[ name, style(code, FontColors.default) ]
)) as Record<Color, StyleTag>;

export const background_color = Object.fromEntries(Object.entries(BackgroundColors).map(([name, code]): [string, StyleTag] => 
	[ name, style(code, BackgroundColors.default) ]
)) as Record<Color, StyleTag>;
