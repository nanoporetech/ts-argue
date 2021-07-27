import type { FONT_COLORS, MODIFIERS } from './style.constants';

export type Color = keyof typeof FONT_COLORS; // same colors available for Font vs Background
export type Modifier = keyof typeof MODIFIERS;
export type StyleTag = (template: TemplateStringsArray | string, ...values: string[]) => string; 