import * as style from './style';
import { remove_styles, truncate_styled_string } from './style';
import { ESC, MODIFIERS } from './style.constants';

let force_color: string | undefined;

beforeAll(() => {
  process.env.FORCE_COLOR = '1';
});

beforeEach(() => {
  force_color = process.env.FORCE_COLOR;
  process.stdout.getColorDepth = () => 2;
});
afterEach(() => {
  process.env.FORCE_COLOR = force_color;
  process.stdout.isTTY = false;
  process.stdout.getColorDepth = () => 2;
});

afterAll(() => {
  delete process.env.FORCE_COLOR;
});

it('style produces a StyleTag function for a given prefix/suffix', () => {
  expect(style.style('1', '0')('hello world')).toEqual('\u001b[1mhello world\u001b[0m');
  expect(style.style('1', '0')`hello ${'lucky winner'}`).toEqual('\u001b[1mhello lucky winner\u001b[1m\u001b[0m');
});
it('custom produces a StyleTag function for a given prefix/suffix', () => {
  expect(style.custom('1', '31')('hello world')).toEqual('\u001b[1;31mhello world\u001b[39;22m');
  expect(style.custom('1', '31')`hello ${'lucky winner'}`).toEqual('\u001b[1;31mhello lucky winner\u001b[1;31m\u001b[39;22m');
});
it('custom reject invalid style', () => {
  expect(() => style.custom('999')).toThrow('');
});
it('custom correctly handles pop codes for styles', () => {
  const bold = ESC + MODIFIERS.high_intensity + 'm';
  const normal = ESC + MODIFIERS.normal_intensity + 'm';
  // this isn't an expected scenario... but it's plausible, and requires handling
  expect(style.bold`bold ${style.custom(MODIFIERS.normal_intensity)`normal`} bold`).toBe(`${bold}bold ${normal}normal${normal}${bold} bold${normal}`);
});
it('support_color', () => {
  process.env.FORCE_COLOR = '0';
  expect(style.supports_color()).toBeFalsy();
  process.env.FORCE_COLOR = 'nonsense';
  expect(style.supports_color()).toBeTruthy();
  process.env.FORCE_COLOR = '';
  expect(style.supports_color()).toBeTruthy();
  process.env.FORCE_COLOR = '1';
  expect(style.supports_color()).toBeTruthy();
  delete process.env.FORCE_COLOR;
  expect(style.supports_color()).toBe(!!process.stdout.isTTY); // test script is always run in a non TTY mode, assume that if it's TTY then we have color here
  process.stdout.isTTY = true;
  expect(style.supports_color()).toBeFalsy();
  process.stdout.getColorDepth = () => 4;
  expect(style.supports_color()).toBeTruthy();
});
it('styles are disabled if color is not supported', () => {
  process.env.FORCE_COLOR = '0';
  expect(style.dim('example')).toEqual('example');
  expect(style.dim`Hello ${ 'world' }`).toEqual('Hello world');
  process.env.FORCE_COLOR = '1';
  expect(style.dim('example')).toEqual('\u001b[2mexample\u001b[22m');
  expect(style.dim`Hello ${ 'world' }`).toEqual('\u001b[2mHello world\u001b[2m\u001b[22m');
});
it('dim', () => {
  expect(style.dim('example')).toEqual('\u001b[2mexample\u001b[22m');
});
it('bold', () => {
  expect(style.bold('example')).toEqual('\u001b[1mexample\u001b[22m');
});
it('underline', () => {
  expect(style.underline('example')).toEqual('\u001b[4mexample\u001b[24m');
});
it('blink', () => {
  expect(style.blink('example')).toEqual('\u001b[5mexample\u001b[25m');
});
it('reverse', () => {
  expect(style.reverse('example')).toEqual('\u001b[7mexample\u001b[27m');
});
it('strikethrough', () => {
  expect(style.strikethrough('example')).toEqual('\u001b[9mexample\u001b[29m');
});
it('font_color', () => {
  expect(style.font_color.black('example')).toEqual('\u001b[30mexample\u001b[39m');
  expect(style.font_color.red('example')).toEqual('\u001b[31mexample\u001b[39m');
  expect(style.font_color.green('example')).toEqual('\u001b[32mexample\u001b[39m');
  expect(style.font_color.yellow('example')).toEqual('\u001b[33mexample\u001b[39m');
  expect(style.font_color.blue('example')).toEqual('\u001b[34mexample\u001b[39m');
  expect(style.font_color.magenta('example')).toEqual('\u001b[35mexample\u001b[39m');
  expect(style.font_color.cyan('example')).toEqual('\u001b[36mexample\u001b[39m');
  expect(style.font_color.white('example')).toEqual('\u001b[37mexample\u001b[39m');
  expect(style.font_color.default('example')).toEqual('\u001b[39mexample\u001b[39m');
  expect(style.font_color.bright_black('example')).toEqual('\u001b[90mexample\u001b[39m');
  expect(style.font_color.bright_red('example')).toEqual('\u001b[91mexample\u001b[39m');
  expect(style.font_color.bright_green('example')).toEqual('\u001b[92mexample\u001b[39m');
  expect(style.font_color.bright_yellow('example')).toEqual('\u001b[93mexample\u001b[39m');
  expect(style.font_color.bright_blue('example')).toEqual('\u001b[94mexample\u001b[39m');
  expect(style.font_color.bright_magenta('example')).toEqual('\u001b[95mexample\u001b[39m');
  expect(style.font_color.bright_cyan('example')).toEqual('\u001b[96mexample\u001b[39m');
  expect(style.font_color.bright_white('example')).toEqual('\u001b[97mexample\u001b[39m');
});
it('background_color', () => {
  expect(style.background_color.black('example')).toEqual('\u001b[40mexample\u001b[49m');
  expect(style.background_color.red('example')).toEqual('\u001b[41mexample\u001b[49m');
  expect(style.background_color.green('example')).toEqual('\u001b[42mexample\u001b[49m');
  expect(style.background_color.yellow('example')).toEqual('\u001b[43mexample\u001b[49m');
  expect(style.background_color.blue('example')).toEqual('\u001b[44mexample\u001b[49m');
  expect(style.background_color.magenta('example')).toEqual('\u001b[45mexample\u001b[49m');
  expect(style.background_color.cyan('example')).toEqual('\u001b[46mexample\u001b[49m');
  expect(style.background_color.white('example')).toEqual('\u001b[47mexample\u001b[49m');
  expect(style.background_color.default('example')).toEqual('\u001b[49mexample\u001b[49m');
  expect(style.background_color.bright_black('example')).toEqual('\u001b[100mexample\u001b[49m');
  expect(style.background_color.bright_red('example')).toEqual('\u001b[101mexample\u001b[49m');
  expect(style.background_color.bright_green('example')).toEqual('\u001b[102mexample\u001b[49m');
  expect(style.background_color.bright_yellow('example')).toEqual('\u001b[103mexample\u001b[49m');
  expect(style.background_color.bright_blue('example')).toEqual('\u001b[104mexample\u001b[49m');
  expect(style.background_color.bright_magenta('example')).toEqual('\u001b[105mexample\u001b[49m');
  expect(style.background_color.bright_cyan('example')).toEqual('\u001b[106mexample\u001b[49m');
  expect(style.background_color.bright_white('example')).toEqual('\u001b[107mexample\u001b[49m');
});
it('remove_styles', () => {
  expect(remove_styles(style.bold`Hello world!`)).toEqual('Hello world!');
});
describe('truncate_styled_string', () => {
  it('doesn\'t truncate string with exact length', () => {
    expect(truncate_styled_string(style.bold`Hello world!`, 12)).toEqual({
      text: style.bold`Hello world!`,
      length: 12,
    });
  });
  it('truncates to the correct length', () => {
    expect(truncate_styled_string(style.bold`Hello world!`, 5)).toEqual({
      text: style.bold`Hell…`,
      length: 5
    });
  });
  it('correctly handles nested styles', () => {
    const bold_prefix = ESC + MODIFIERS.high_intensity + 'm';
    const dim_prefix = ESC + MODIFIERS.low_intensity + 'm';
    const suffix = ESC + MODIFIERS.normal_intensity + 'm';
    expect(truncate_styled_string(style.bold`Hello ${style.dim`new`} world`, 14)).toEqual({
      // NOTE tagged literals technically repush the start tag after each nest,
      // but only close at the end. Hence are not symmetrical and cause the truncation algorithm
      // to emit n + 1 closes at the end ( n being the number of values in the literal )
      // HOWEVER, a recent change now de-duplicates matching tags
      text: `${bold_prefix}Hello ${dim_prefix}new${suffix}${bold_prefix} wor…${suffix}`,
      length: 14,
    });
  });
  it('correctly handles partial styles', () => {
    const bold_prefix = ESC + MODIFIERS.high_intensity + 'm';
    const dim_prefix = ESC + MODIFIERS.low_intensity + 'm';
    const combined_suffix = ESC + MODIFIERS.normal_intensity + 'm';
    expect(truncate_styled_string(style.bold`Hello ${style.dim`new`} world`, 8)).toEqual({
      text: `${bold_prefix}Hello ${dim_prefix}n…${combined_suffix}`, // NOTE output of function here is subtly different to tagged template literal
      length: 8,
    });
  });
  it('returns an empty string for an empty string', () => {
    expect(truncate_styled_string('', 10)).toEqual({
      text: '',
      length: 0,
    });
  });
  it('returns an empty string if limit is 0', () => {
    expect(truncate_styled_string('Hello', 0)).toEqual({
      text: '',
      length: 0,
    });
  });
  it('returns just an ellipsis if limit is 1', () => {
    expect(truncate_styled_string('Hello', 1)).toEqual({
      text: '…',
      length: 1,
    });
  });
  it('...but not if source is 1 char', () => {
    expect(truncate_styled_string('H', 1)).toEqual({
      text: 'H',
      length: 1,
    });
  });
  it('throws for unknown style codes', () => {
    expect(() => truncate_styled_string(ESC + '999' + 'm', 10)).toThrow('Unknown style code discovered 999');
  });
});