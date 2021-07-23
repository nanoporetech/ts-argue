import type { Color, StyleTag } from './style.type';

import { BACKGROUND_COLORS, ESC, FONT_COLORS, MODIFIERS } from './style.constants';

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

export const dim = style(MODIFIERS.low_intensity, MODIFIERS.normal_intensity);
export const bold = style(MODIFIERS.high_intensity, MODIFIERS.normal_intensity);
export const underline = style(MODIFIERS.underline, MODIFIERS.no_underline);
export const blink = style(MODIFIERS.blink, MODIFIERS.no_blink);
export const reverse = style(MODIFIERS.reverse, MODIFIERS.no_reverse);
export const strikethrough = style(MODIFIERS.strikethrough, MODIFIERS.no_strikethrough);

export const font_color = Object.fromEntries(Object.entries(FONT_COLORS).map(([name, code]): [string, StyleTag] => 
	[ name, style(code, FONT_COLORS.default) ]
)) as Record<Color, StyleTag>;

export const background_color = Object.fromEntries(Object.entries(BACKGROUND_COLORS).map(([name, code]): [string, StyleTag] => 
	[ name, style(code, BACKGROUND_COLORS.default) ]
)) as Record<Color, StyleTag>;
