import type { Color, StyleTag } from './style.type';

import { BACKGROUND_COLORS, ESC, FONT_COLORS, MODIFIERS, POP_CODES, PUSH_CODES } from './style.constants';
import { asDefined, asString } from 'ts-runtime-typecheck';

export function style (pre: string, post: string): StyleTag {
	const prefix = ESC + pre + 'm';
	const postfix = ESC + post + 'm';
	return (template: TemplateStringsArray | string, ...values: string[]) => {
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

export function remove_styles(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001B\[[0-9]+m/ug, '');
}

export function truncate_styled_string(source: string, limit: number): { text: string; length: number } {
  if (source === '' || limit <= 0) {
    return {
      text: '',
      length: 0,
    };
  }

  // eslint-disable-next-line no-control-regex
  const tokens = asDefined(source.match(/(?:\u001B\[[0-9]+m)|[^\u001B]/ug));

  // split out tokens into style ( non-printing ) and actual text
  const tagged_tokens = Array.from(tokens).map(token => {
    if (token.startsWith(ESC)) {
      const code = token.slice(2, -1);
      const is_valid = PUSH_CODES.has(code) || POP_CODES.has(code);
      if (!is_valid) {
        throw new Error(`Unknown style code discovered ${code}`);
      }
      return { code, text: token };
    } else {
      return { text: token };
    }
  });

  // count the non-style tokens to get the actual length
  const total_letters = tagged_tokens.reduce((acc, token) => 'code' in token ? acc : acc + 1, 0);

  // doesn't need truncating so just return the original string
  if (total_letters <= limit) {
    return {
      text: source,
      length: total_letters,
    };
  }

  // catch the edge case where the length is 1 as we cannot print text + ellipsis
  if (limit === 1) {
    return {
      text: '…',
      length: 1,
    };
  }
  // adjust the length for the ellipsis
  limit -= 1;

  const style_stack: string[] = [];
  const chars: string[] = [];
  let char_count = 0;

  for (const token of tagged_tokens) {
    if (token.code) {
      if (PUSH_CODES.has(token.code)) {
        style_stack.unshift(token.code);
      } else {
        // well formed style codes should always work in pairs, like brackets
        // if we follow this assumption any pop code can just be treated as
        // a generic pop
        style_stack.shift();
      }
    } else {
      if (char_count === limit) {
        break;
      }
      char_count += 1;
    }
    chars.push(token.text);
  }

  chars.push('…');

  // insert the reset codes for the remaining style tokens.
  for (const code of style_stack) {
    // checked as defined when we tag the tokens
    chars.push(ESC + asString(PUSH_CODES.get(code)) + 'm');
  }

  return {
    text:  chars.join(''),
    length: char_count + 1,
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
