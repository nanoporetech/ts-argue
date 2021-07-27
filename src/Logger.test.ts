import { assertDefined } from 'ts-runtime-typecheck';
import { log } from './Logger';

let std_output: jest.SpiedFunction<typeof process.stdout.write> | null = null;
let log_output: jest.SpiedFunction<typeof console.log> | null = null;
beforeEach(() => {
  std_output = jest.spyOn(process.stdout, 'write');
  log_output = jest.spyOn(console, 'log');
  log.indent = 0;
});
afterEach(() => {
  std_output && std_output.mockRestore();
  log_output && log_output.mockRestore();
  std_output = null;
  log_output = null;
});
it('prints to process.stdout', () => {
  assertDefined(std_output);
  log.print('hello world');
  expect(std_output.mock.calls).toEqual([
    ['hello world']
  ]);
});
it('increase_indent/decrease_indent modifies indent level', () => {
  assertDefined(std_output);

  expect(log.indent).toEqual(0);

  log.increase_indent();

  expect(log.indent).toEqual(2);

  log.start_line();
  log.increase_indent();

  expect(log.indent).toEqual(4);

  log.start_line();
  log.decrease_indent();

  expect(log.indent).toEqual(2);

  log.decrease_indent();

  expect(log.indent).toEqual(0);

  log.decrease_indent();
  
  expect(log.indent).toEqual(0);
  expect(std_output.mock.calls).toEqual([
    ['  '],
    ['    ']
  ]);
});
it('print_line includes indent and newline', () => {
  assertDefined(std_output);

  log.increase_indent();
  log.print_line('hello world');
  log.decrease_indent();

  expect(std_output.mock.calls).toEqual([
    ['  hello world\n'],
  ]);
});
it('print_lines includes indent and newline for each element', () => {
  assertDefined(std_output);

  log.increase_indent();
  log.print_lines(['hello','world']);
  log.decrease_indent();

  expect(std_output.mock.calls).toEqual([
    ['  hello\n'],
    ['  world\n'],
  ]);
});
it('new_line prints a newline character', () => {
  assertDefined(std_output);

  log.new_line();

  expect(std_output.mock.calls).toEqual([
    ['\n'],
  ]);
});

it('info calls console.log with custom prefix', () => {
  assertDefined(log_output);

  log.info('hello world');

  expect(log_output.mock.calls).toEqual([
    ['info  -', 'hello world'],
  ]);
});

it('debug calls console.log with custom prefix', () => {
  assertDefined(log_output);

  log.debug('hello world');

  expect(log_output.mock.calls).toEqual([
    ['\u001b[34mdebug -\u001b[39m', 'hello world'],
  ]);
});

it('warn calls console.log with custom prefix', () => {
  assertDefined(log_output);

  log.warn('hello world');

  expect(log_output.mock.calls).toEqual([
    ['\u001b[33mwarn  -\u001b[39m', 'hello world'],
  ]);
});

it('error calls console.log with custom prefix', () => {
  assertDefined(log_output);

  log.error('hello world');

  expect(log_output.mock.calls).toEqual([
    ['\u001b[31merror -\u001b[39m', 'hello world'],
  ]);
});