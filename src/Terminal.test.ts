import { assertDefined } from 'ts-runtime-typecheck';
import { terminal } from './Terminal';
import * as style from './style';
import enquirer from 'enquirer';

let std_output: jest.SpiedFunction<typeof process.stdout.write> | null = null;
let log_output: jest.SpiedFunction<typeof console.log> | null = null;
let process_exit: jest.SpiedFunction<typeof process.exit> | null = null;
let enquirer_prompt: jest.SpiedFunction<typeof enquirer.prompt> | null = null;

const exit = new Error('not a real error');

beforeEach(() => {
  enquirer_prompt = jest.spyOn(enquirer, 'prompt').mockRejectedValue('mock not implemented');
  process_exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw exit; });
  std_output = jest.spyOn(process.stdout, 'write');
  log_output = jest.spyOn(console, 'log');
  terminal.indent = 0;
});

afterEach(() => {
  std_output && std_output.mockRestore();
  log_output && log_output.mockRestore();
  process_exit && process_exit.mockRestore();
  enquirer_prompt && enquirer_prompt.mockRestore();
  std_output = null;
  log_output = null;
  process_exit = null;
  enquirer_prompt = null;
});

it('prints to process.stdout', () => {
  assertDefined(std_output);
  terminal.print('hello world');
  expect(std_output.mock.calls).toEqual([
    ['hello world']
  ]);
});
it('increase_indent/decrease_indent modifies indent level', () => {
  assertDefined(std_output);

  expect(terminal.indent).toEqual(0);

  terminal.increase_indent();

  expect(terminal.indent).toEqual(2);

  terminal.start_line();
  terminal.increase_indent();

  expect(terminal.indent).toEqual(4);

  terminal.start_line();
  terminal.decrease_indent();

  expect(terminal.indent).toEqual(2);

  terminal.decrease_indent();

  expect(terminal.indent).toEqual(0);

  terminal.decrease_indent();
  
  expect(terminal.indent).toEqual(0);
  expect(std_output.mock.calls).toEqual([
    ['  '],
    ['    ']
  ]);
});
it('print_line includes indent and newline', () => {
  assertDefined(std_output);

  terminal.increase_indent();
  terminal.print_line('hello world');
  terminal.decrease_indent();

  expect(std_output.mock.calls).toEqual([
    ['  hello world\n'],
  ]);
});
it('print_lines includes indent and newline for each element', () => {
  assertDefined(std_output);

  terminal.increase_indent();
  terminal.print_lines(['hello','world']);
  terminal.decrease_indent();

  expect(std_output.mock.calls).toEqual([
    ['  hello\n'],
    ['  world\n'],
  ]);
});
it('new_line prints a newline character', () => {
  assertDefined(std_output);

  terminal.new_line();

  expect(std_output.mock.calls).toEqual([
    ['\n'],
  ]);
});

it('info calls console.log with custom prefix', () => {
  assertDefined(log_output);

  terminal.info('hello world');

  expect(log_output.mock.calls).toEqual([
    // NOTE there is an extra space here, so that info/error/warn/debug align
    ['info  -', 'hello world'],
  ]);
});

it('debug calls console.log with custom prefix', () => {
  assertDefined(log_output);

  terminal.debug('hello world');

  expect(log_output.mock.calls).toEqual([
    [style.font_color.blue`debug -`, 'hello world'],
  ]);
});

it('warn calls console.log with custom prefix', () => {
  assertDefined(log_output);

  terminal.warn('hello world');

  expect(log_output.mock.calls).toEqual([
    // NOTE there is an extra space here, so that info/error/warn/debug align
    [style.font_color.yellow`warn  -`, 'hello world'],
  ]);
});

it('error calls console.log with custom prefix', () => {
  assertDefined(log_output);

  terminal.error('hello world');

  expect(log_output.mock.calls).toEqual([
    [style.font_color.red`error -`, 'hello world'],
  ]);
});

describe('print_table', () => {
  it('prints a large table with headers', () => {
    const headers = [
      'name', 'value', 'description'
    ];
    terminal.increase_indent();
    terminal.print_table([
      ['alpha', '42', 'unknown'],
      ['beta', '1000', style.font_color.red`like a cheater, but worse`],
      [style.bold`charlie`, '0', 'pub landlord'],
      [style.background_color.magenta`catch the edge case where the length is 1 as we cannot print text + ellipsis`, '', 'print_lines includes indent and newline for each element']
    ], headers);
    terminal.decrease_indent();

    assertDefined(std_output);

    expect(std_output.mock.calls).toEqual([
      ['  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┯━━━━━━━┯━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'],
      ['  name                              │ value │ description                      \n'],
      ['  ──────────────────────────────────┼───────┼──────────────────────────────────\n'],
      ['  alpha                             │ 42    │ unknown                          \n'],
      [`  beta                              │ 1000  │ ${style.font_color.red`like a cheater, but worse`}        \n`],
      [`  ${style.bold`charlie`}                           │ 0     │ pub landlord                     \n`],
      [`  ${style.background_color.magenta`catch the edge case where the le…`} │       │ print_lines includes indent and …\n`],
      ['  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┷━━━━━━━┷━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'],
    ]);
  });

  it('prints a large table without headers', () => {
    terminal.increase_indent();
    terminal.print_table([
      ['alpha', '42', 'unknown'],
      ['beta', '1000', style.font_color.red`like a cheater, but worse`],
      [style.bold`charlie`, '0', 'pub landlord'],
      [style.background_color.magenta`catch the edge case where the length is 1 as we cannot print text + ellipsis`, '', 'print_lines includes indent and newline for each element']
    ]);
    terminal.decrease_indent();

    assertDefined(std_output);

    expect(std_output.mock.calls).toEqual([
      ['  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┯━━━━━━┯━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'],
      ['  alpha                              │ 42   │ unknown                           \n'],
      [`  beta                               │ 1000 │ ${style.font_color.red`like a cheater, but worse`}         \n`],
      [`  ${style.bold`charlie`}                            │ 0    │ pub landlord                      \n`],
      [`  ${style.background_color.magenta`catch the edge case where the len…`} │      │ print_lines includes indent and n…\n`],
      ['  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┷━━━━━━┷━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'],
    ]);
  });

  it('prints a small table without headers', () => {
    terminal.print_table([
      ['alpha', '42', 'unknown'],
    ]);

    assertDefined(std_output);

    expect(std_output.mock.calls).toEqual([
      ['━━━━━━┯━━━━┯━━━━━━━━\n'],
      ['alpha │ 42 │ unknown\n'],
      ['━━━━━━┷━━━━┷━━━━━━━━\n'],
    ]);
  });

  it('prints a small table without all cells/headers', () => {
    terminal.print_table([
      ['beta', ''],
      ['alpha', '42', 'unknown'],
    ], [ 'name' ]);

    assertDefined(std_output);

    expect(std_output.mock.calls).toEqual([
      ['━━━━━━┯━━━━┯━━━━━━━━\n'],
      ['name  │    │        \n'],
      ['──────┼────┼────────\n'],
      ['beta  │    │        \n'],
      ['alpha │ 42 │ unknown\n'],
      ['━━━━━━┷━━━━┷━━━━━━━━\n'],
    ]);
  });
});

it('confirm calls enquirer', async () => {
  assertDefined(enquirer_prompt);
  enquirer_prompt.mockResolvedValue({ result: true });
  expect(await terminal.confirm('example', true)).toEqual(true);
});

it('input calls enquirer', async () => {
  assertDefined(enquirer_prompt);
  enquirer_prompt.mockResolvedValue({ result: 'yes' });
  expect(await terminal.input('example', 'yes')).toEqual('yes');
});

it('options calls enquirer', async () => {
  assertDefined(enquirer_prompt);
  enquirer_prompt.mockResolvedValue({ result: 'yes' });
  expect(await terminal.options('example', ['yes', 'no'])).toEqual('yes');
});

it('cancelled options prompt call process.exit', async () => {
  await expect(() => terminal.options('example', ['yes'])).rejects.toEqual(exit);
  expect(process_exit?.mock.calls).toEqual([
    [1]
  ]);
});

it('cancelled confirm prompt call process.exit', async () => {
  await expect(() => terminal.confirm('example')).rejects.toEqual(exit);
  expect(process_exit?.mock.calls).toEqual([
    [1]
  ]);
});

it('cancelled input prompt call process.exit', async () => {
  await expect(() => terminal.input('example')).rejects.toEqual(exit);
  expect(process_exit?.mock.calls).toEqual([
    [1]
  ]);
});