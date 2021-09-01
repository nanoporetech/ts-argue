import { assertDefined } from 'ts-runtime-typecheck';
import { print_help } from './print_help';
import * as style from './style';

let std_output: jest.SpiedFunction<typeof process.stdout.write> | null = null;
beforeEach(() => {
  std_output = jest.spyOn(process.stdout, 'write');
});
afterEach(() => {
  std_output && std_output.mockRestore();
  std_output = null;
});

it('prints usage + inbuilt options/commands with stub', () => {
  assertDefined(std_output);
  print_help('example', {});
  expect(std_output.mock.calls.map(([str]) => str)).toEqual([
    `${style.bold`USAGE:`} example ${style.dim`[options] [command]`}\n`,
    '\n',
    style.bold('COMMANDS:') + '\n',
    `  help      ${style.dim('Display help')}\n`,
    `  version   ${style.dim('Display version')}\n`,
    '\n',
    style.bold('OPTIONS:') + '\n',
    `  --help    ${style.dim('Output usage information')}\n`,
    `  --version ${style.dim('Output the version number')}\n`,
    '\n',
  ]);
});

it('prints custom options/commands', () => {
  assertDefined(std_output);
  print_help('example', {
    subcommands: {
      index: {},
      alpha: {
        description: 'this is description'
      },
      beta: {
        description: ''
      }
    },
    options: {
      zebra: '',
      deactivate: 'an option perhaps',
      eel: 'slimy'
    }
  });
  expect(std_output.mock.calls.map(([str]) => str)).toEqual([
    `${style.bold`USAGE:`} example ${style.dim`[options] [command]`}\n`,
    '\n',
    style.bold('COMMANDS:') + '\n',
    `  alpha        ${style.dim('this is description')}\n`,
    `  beta         ${style.dim('')}\n`,
    `  help         ${style.dim('Display help')}\n`,
    `  index        ${style.dim('')}\n`,
    `  version      ${style.dim('Display version')}\n`,
    '\n',
    style.bold('OPTIONS:') + '\n',
    `  --deactivate ${style.dim('an option perhaps')}\n`,
    `  --eel        ${style.dim('slimy')}\n`,
    `  --help       ${style.dim('Output usage information')}\n`,
    `  --version    ${style.dim('Output the version number')}\n`,
    `  --zebra      ${style.dim('')}\n`,
    '\n',
  ]);
});

it('prints description', () => {
  assertDefined(std_output);
  print_help('example', {
    description: 'something about example'
  });
  expect(std_output.mock.calls.map(([str]) => str)).toEqual([
    'something about example\n',
    '\n',
    `${style.bold`USAGE:`} example ${style.dim`[options] [command]`}\n`,
    '\n',
    style.bold('COMMANDS:') + '\n',
    `  help      ${style.dim('Display help')}\n`,
    `  version   ${style.dim('Display version')}\n`,
    '\n',
    style.bold('OPTIONS:') + '\n',
    `  --help    ${style.dim('Output usage information')}\n`,
    `  --version ${style.dim('Output the version number')}\n`,
    '\n',
  ]);
});

it('prints examples', () => {
  assertDefined(std_output);
  print_help('example', {
    examples: [
      'two',
      'one',
    ]
  });

  expect(std_output.mock.calls.map(([str]) => str)).toEqual([
    `${style.bold`USAGE:`} example ${style.dim`[options] [command]`}\n`,
    '\n',
    style.bold('EXAMPLES:') + '\n',
    `  ${style.dim`${'example'} ${'two'}`}\n`,
    `  ${style.dim`${'example'} ${'one'}`}\n`,
    '\n',
    style.bold('COMMANDS:') + '\n',
    `  help      ${style.dim('Display help')}\n`,
    `  version   ${style.dim('Display version')}\n`,
    '\n',
    style.bold('OPTIONS:') + '\n',
    `  --help    ${style.dim('Output usage information')}\n`,
    `  --version ${style.dim('Output the version number')}\n`,
    '\n',
  ]);
});

it('prints automatic examples', () => {
  assertDefined(std_output);
  print_help('example', {
    subcommands: {
      a: { action () { return; } },
      b: { action () { return; } }
    }
  });

  expect(std_output.mock.calls.map(([str]) => str)).toEqual([
    `${style.bold`USAGE:`} example ${style.dim`[options] [command]`}\n`,
    '\n',
    style.bold('EXAMPLES:') + '\n',
    `  ${style.dim`${'example a'}`}\n`,
    `  ${style.dim`${'example b'}`}\n`,
    '\n',
    style.bold('COMMANDS:') + '\n',
    `  a         ${style.dim('')}\n`,
    `  b         ${style.dim('')}\n`,
    `  help      ${style.dim('Display help')}\n`,
    `  version   ${style.dim('Display version')}\n`,
    '\n',
    style.bold('OPTIONS:') + '\n',
    `  --help    ${style.dim('Output usage information')}\n`,
    `  --version ${style.dim('Output the version number')}\n`,
    '\n',
  ]);
});

/*
  test prints examples if included
*/