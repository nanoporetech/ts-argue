import { assertDefined } from 'ts-runtime-typecheck';
import { Terminal, terminal } from './Terminal';
import * as style from './style';
import enquirer from 'enquirer';
import type { WriteStream as TTYWriteStream } from 'tty';

type PromptOptions = Parameters<typeof enquirer.prompt>[0];

let std_output: jest.SpiedFunction<typeof process.stdout.write> | null = null;
let std_error: jest.SpiedFunction<typeof process.stdout.write> | null = null;
let process_exit: jest.SpiedFunction<typeof process.exit> | null = null;
let enquirer_prompt: jest.SpiedFunction<typeof enquirer.prompt> | null = null;

const exit = new Error('not a real error');

const unwrap_enquirer_opts = (opt: PromptOptions) => typeof opt === 'function' || Array.isArray(opt) ? null : opt;

interface PublicTerminal {
  indent: number;
  dirty_line: symbol | null;
  interactive: boolean;
}

// Terminal purposefully hides indent and dirty_line from the public interface
// but to test it properly we need to poke at these values a bit
function as_public_terminal (term: Terminal):  PublicTerminal {
  return term as unknown as PublicTerminal;
}

beforeEach(() => {
  enquirer_prompt = jest.spyOn(enquirer, 'prompt').mockRejectedValue('mock not implemented');
  process_exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw exit; });
  std_output = jest.spyOn(process.stdout, 'write');
  std_error = jest.spyOn(process.stderr, 'write');

  as_public_terminal(terminal).indent = 0;
  as_public_terminal(terminal).dirty_line = null;
});

afterEach(() => {
  process.stdout.write('\n');
  std_output && std_output.mockRestore();
  std_error && std_error.mockRestore();
  process_exit && process_exit.mockRestore();
  enquirer_prompt && enquirer_prompt.mockRestore();
  std_output = null;
  process_exit = null;
  enquirer_prompt = null;
});

it('increase_indent/decrease_indent modifies indent level', () => {
  assertDefined(std_output);

  expect(as_public_terminal(terminal).indent).toEqual(0);

  terminal.increase_indent();

  expect(as_public_terminal(terminal).indent).toEqual(2);

  terminal.print_line('');
  terminal.increase_indent();

  expect(as_public_terminal(terminal).indent).toEqual(4);

  terminal.print_line('');
  terminal.decrease_indent();

  expect(as_public_terminal(terminal).indent).toEqual(2);

  terminal.decrease_indent();

  expect(as_public_terminal(terminal).indent).toEqual(0);

  terminal.decrease_indent();
  
  expect(as_public_terminal(terminal).indent).toEqual(0);
  expect(std_output.mock.calls).toEqual([
    ['  \n'],
    ['    \n']
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
it('print_line clear dirty flag if set', () => {
  assertDefined(std_output);

  as_public_terminal(terminal).dirty_line = Symbol();
  terminal.print_line('hello');

  expect(std_output.mock.calls).toEqual([
    ['hello\n'],
  ]);
  expect(as_public_terminal(terminal).dirty_line).toBe(null);
});
it('print_line outputs to std_err if specified', () => {
  assertDefined(std_error);

  terminal.increase_indent();
  terminal.print_line('hello\nworld', 'stderr');
  terminal.decrease_indent();

  expect(std_error.mock.calls).toEqual([
    ['  hello\n  world\n'],
  ]);
});
it('print_line corrects indentation when passed multiple lines', () => {
  assertDefined(std_output);

  terminal.increase_indent();
  terminal.print_line('hello\nworld');
  terminal.decrease_indent();

  expect(std_output.mock.calls).toEqual([
    ['  hello\n  world\n'],
  ]);
});
it('print_lines includes indent and newline for each element', () => {
  assertDefined(std_output);

  terminal.increase_indent();
  terminal.print_lines(['hello','new\nworld']);
  terminal.decrease_indent();

  expect(std_output.mock.calls).toEqual([
    [ '  hello\n  new\n  world\n' ],
  ]);
});
it('print_lines prints to stderr if specified', () => {
  assertDefined(std_error);

  terminal.increase_indent();
  terminal.print_lines(['hello','new\nworld'], 'stderr');
  terminal.decrease_indent();

  expect(std_error.mock.calls).toEqual([
    [ '  hello\n  new\n  world\n' ],
  ]);
});
it('print_lines clear dirty flag if set', () => {
  assertDefined(std_output);

  as_public_terminal(terminal).dirty_line = Symbol();
  terminal.print_lines(['hello']);

  expect(std_output.mock.calls).toEqual([
    ['hello\n'],
  ]);
  expect(as_public_terminal(terminal).dirty_line).toBe(null);
});
it('new_line prints a newline character', () => {
  assertDefined(std_output);

  terminal.new_line();

  expect(std_output.mock.calls).toEqual([
    ['\n'],
  ]);
});
it('new_line prints to stderr if specified', () => {
  assertDefined(std_error);

  terminal.new_line('stderr');

  expect(std_error.mock.calls).toEqual([
    ['\n'],
  ]);
});

describe('reusable_line', () => {
  it('works in non-interactive mode', () => {
    const line = terminal.reusable_block();
    line('a');
    line('b');
    terminal.increase_indent();
    line('c');

    assertDefined(std_output);

    expect(std_output.mock.calls).toEqual([
      ['a\n'],
      ['b\n'],
      ['  c\n']
    ]);
  });

  it('clears line in interactive mode', () => {

    process.stdout.isTTY = true;
    const stdout_moveto = process.stdout.moveCursor = jest.fn();
    const stdout_clearline = process.stdout.clearLine = jest.fn();
    const stdout_cursorto = process.stdout.cursorTo = jest.fn();

    try {
      const line = terminal.reusable_block();

      line('a');
      expect(stdout_moveto.mock.calls.length).toBe(0);
      expect(stdout_clearline.mock.calls.length).toBe(0);
      expect(stdout_cursorto.mock.calls.length).toBe(0);
      line('b');
      expect(stdout_moveto.mock.calls.length).toBe(1);
      expect(stdout_clearline.mock.calls.length).toBe(1);
      expect(stdout_cursorto.mock.calls.length).toBe(1);
      line('c');
      expect(stdout_moveto.mock.calls.length).toBe(2);
      expect(stdout_clearline.mock.calls.length).toBe(2);
      expect(stdout_cursorto.mock.calls.length).toBe(2);
      line('d', 'e');
      expect(stdout_moveto.mock.calls.length).toBe(3);
      expect(stdout_clearline.mock.calls.length).toBe(3);
      expect(stdout_cursorto.mock.calls.length).toBe(3);
      line();
      expect(stdout_moveto.mock.calls.length).toBe(5);
      expect(stdout_clearline.mock.calls.length).toBe(5);
      expect(stdout_cursorto.mock.calls.length).toBe(4);
    } finally {
      process.stdout.isTTY = false;
      const stdout = process.stdout as Partial<TTYWriteStream>;
      delete stdout.clearLine;
      delete stdout.cursorTo;
      delete stdout.moveCursor;
    }
  });

  it('uses stderr if specified', () => {

    process.stderr.isTTY = true;
    const stdout_moveto = process.stderr.moveCursor = jest.fn();
    const stdout_clearline = process.stderr.clearLine = jest.fn();
    const stdout_cursorto = process.stderr.cursorTo = jest.fn();

    try {
      const line = terminal.reusable_block('stderr');

      line('a');
      expect(stdout_moveto.mock.calls.length).toBe(0);
      expect(stdout_clearline.mock.calls.length).toBe(0);
      expect(stdout_cursorto.mock.calls.length).toBe(0);
      line('b');
      expect(stdout_moveto.mock.calls.length).toBe(1);
      expect(stdout_clearline.mock.calls.length).toBe(1);
      expect(stdout_cursorto.mock.calls.length).toBe(1);
      line('c');
      expect(stdout_moveto.mock.calls.length).toBe(2);
      expect(stdout_clearline.mock.calls.length).toBe(2);
      expect(stdout_cursorto.mock.calls.length).toBe(2);
      line('d', 'e');
      expect(stdout_moveto.mock.calls.length).toBe(3);
      expect(stdout_clearline.mock.calls.length).toBe(3);
      expect(stdout_cursorto.mock.calls.length).toBe(3);
      line();
      expect(stdout_moveto.mock.calls.length).toBe(5);
      expect(stdout_clearline.mock.calls.length).toBe(5);
      expect(stdout_cursorto.mock.calls.length).toBe(4);
    } finally {
      process.stderr.isTTY = false;
      const stderr = process.stderr as Partial<TTYWriteStream>;
      delete stderr.clearLine;
      delete stderr.cursorTo;
      delete stderr.moveCursor;
    }
  });
});

describe('progress', () => {
  it('works in non-interactive mode', () => {
    const line = terminal.progress_bar('note');
    line(0);
    line(0.5);
    terminal.increase_indent();
    line(1);

    assertDefined(std_output);

    expect(std_output.mock.calls).toEqual([
      ['note [                                                                         ]\n'],
      ['note [████████████████████████████████████▌                                    ]\n'],
      ['  note [███████████████████████████████████████████████████████████████████████]\n'],
    ]);
  });
  it('uses stderr when set', () => {
    const line = terminal.progress_bar('note', 'stderr');
    line(0);
    line(0.5);
    terminal.increase_indent();
    line(1);

    expect(std_error?.mock.calls).toEqual([
      ['note [                                                                         ]\n'],
      ['note [████████████████████████████████████▌                                    ]\n'],
      ['  note [███████████████████████████████████████████████████████████████████████]\n'],
    ]);
  });
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

  it('prints to stderr when set', () => {
    const headers = [
      'name', 'value', 'description'
    ];
    terminal.increase_indent();
    terminal.print_table([
      ['alpha', '42', 'unknown'],
      ['beta', '1000', style.font_color.red`like a cheater, but worse`],
      [style.bold`charlie`, '0', 'pub landlord'],
      [style.background_color.magenta`catch the edge case where the length is 1 as we cannot print text + ellipsis`, '', 'print_lines includes indent and newline for each element']
    ], headers, 'stderr');
    terminal.decrease_indent();

    expect(std_error?.mock.calls).toEqual([
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

it('confirm passes stdout to enquirer by default', async () => {
  assertDefined(enquirer_prompt);
  enquirer_prompt.mockImplementation((opt: PromptOptions) => Promise.resolve({ result: unwrap_enquirer_opts(opt)?.stdout === process.stdout }));
  expect(await terminal.confirm('example', true)).toEqual(true);
});

it('confirm passes stderr to enquirer if requested', async () => {
  assertDefined(enquirer_prompt);
  enquirer_prompt.mockImplementation((opt: PromptOptions) => Promise.resolve({ result: unwrap_enquirer_opts(opt)?.stdout === process.stderr }));
  expect(await terminal.confirm('example', true, 'stderr')).toEqual(true);
});

it('input calls enquirer', async () => {
  assertDefined(enquirer_prompt);
  enquirer_prompt.mockResolvedValue({ result: 'yes' });
  expect(await terminal.input('example', 'yes')).toEqual('yes');
});

it('input passes stdout to enquirer by default', async () => {
  assertDefined(enquirer_prompt);
  enquirer_prompt.mockImplementation((opt: PromptOptions) => Promise.resolve({ result: unwrap_enquirer_opts(opt)?.stdout === process.stdout }));
  expect(await terminal.input('example', '')).toEqual(true);
});

it('input passes stderr to enquirer if requested', async () => {
  assertDefined(enquirer_prompt);
  enquirer_prompt.mockImplementation((opt: PromptOptions) => Promise.resolve({ result: unwrap_enquirer_opts(opt)?.stdout === process.stderr }));
  expect(await terminal.input('example', '', 'stderr')).toEqual(true);
});

it('select calls enquirer', async () => {
  assertDefined(enquirer_prompt);
  enquirer_prompt.mockResolvedValue({ result: 'yes' });
  expect(await terminal.select('example', ['yes', 'no'])).toEqual('yes');
});

it('input passes stdout to enquirer by default', async () => {
  assertDefined(enquirer_prompt);
  enquirer_prompt.mockImplementation((opt: PromptOptions) => Promise.resolve({ result: unwrap_enquirer_opts(opt)?.stdout === process.stdout }));
  expect(await terminal.select('example', ['yes', 'no'])).toEqual(true);
});

it('input passes stderr to enquirer if requested', async () => {
  assertDefined(enquirer_prompt);
  enquirer_prompt.mockImplementation((opt: PromptOptions) => Promise.resolve({ result: unwrap_enquirer_opts(opt)?.stdout === process.stderr }));
  expect(await terminal.select('example', ['yes', 'no'], 'select', 'stderr')).toEqual(true);
});

it('select throws if an empty list is passed', async () => {
  assertDefined(enquirer_prompt);
  enquirer_prompt.mockResolvedValue({ result: 'yes' });
  await expect(() => terminal.select('example', [])).rejects.toThrow('Implementation error: cannot display an empty selection list.');
});

it('cancelled select prompt call process.exit', async () => {
  await expect(() => terminal.select('example', ['yes'])).rejects.toEqual(exit);
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