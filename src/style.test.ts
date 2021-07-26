import * as style from './style';

it('style produces a StyleTag function for a given prefix/suffix', () => {
  expect(style.style('1', '0')('hello world')).toEqual('\u001b[1mhello world\u001b[0m');
  expect(style.style('1', '0')`hello ${'lucky winner'}`).toEqual('\u001b[1mhello lucky winner\u001b[1m\u001b[0m');
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