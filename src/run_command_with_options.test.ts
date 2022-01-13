import { parse_argv } from './Argv';
import { EXIT_CODE } from './exit_code.constants';
import { run_command_with_options } from './run_command_with_options';
import * as style from './style';

const cfg = { version: '1' };

let std_output: jest.SpiedFunction<typeof process.stdout.write> | null = null;
let std_error: jest.SpiedFunction<typeof process.stderr.write> | null = null;

beforeEach(() => {
  std_output = jest.spyOn(process.stdout, 'write');
  std_error = jest.spyOn(process.stderr, 'write');
});
afterEach(() => {
  std_output && std_output.mockRestore();
  std_error && std_error.mockRestore();
});

it('execute subcommand', async () => {
  let did_run = false;
  const result = await run_command_with_options({
    subcommands: {
      test: {
        parameters: 1,
        action ({ arguments: args}) {
          expect(args).toEqual(['data']);
          did_run = true;
        }
      }
    }
  }, parse_argv(['example', 'test', 'data']), cfg);
  expect(did_run).toEqual(true);
  expect(result).toEqual(undefined);
});
it('execute help subcommand', async () => {
  const result = await run_command_with_options({}, parse_argv(['example', 'help']), cfg);
  expect(std_output?.mock.calls[0][0]).toEqual(`${style.bold`USAGE:`} example ${style.dim`[options]`}\n`);
  expect(result).toEqual(0);
});
it('execute help option', async () => {
  const result = await run_command_with_options({}, parse_argv(['example', '--help']), cfg);
  expect(std_output?.mock.calls[0][0]).toEqual(`${style.bold`USAGE:`} example ${style.dim`[options]`}\n`);
  expect(result).toEqual(0);
});
it('help of subcommand preferred', async () => {
  const result = await run_command_with_options({
    subcommands: {
      sub: {}
    }
  }, parse_argv(['example', 'sub', 'help']), cfg);
  expect(std_output?.mock.calls[0][0]).toEqual(`${style.bold`USAGE:`} example sub ${style.dim`[options]`}\n`);
  expect(result).toEqual(0);
});
it('execute version subcommand', async () => {
  const result = await run_command_with_options({}, parse_argv(['example', 'version']), cfg);
  expect(std_output?.mock.calls[0][0]).toEqual(style.bold`example` + ' version 1\n');
  expect(result).toEqual(0);
});
it('execute version option', async () => {
  const result = await run_command_with_options({}, parse_argv(['example', '--version']), cfg);
  expect(std_output?.mock.calls[0][0]).toEqual(style.bold`example` + ' version 1\n');
  expect(result).toEqual(0);
});
it('execute default subcommand', async () => {
  let did_run = false;
  const result = await run_command_with_options({
    subcommands: {
      list: {
        parameters: 1,
        action ({ arguments: args}) {
          expect(args).toEqual([ 'arg' ]);
          did_run = true;
        }
      }
    },
    default: 'list',
  }, parse_argv(['example', 'arg']), cfg);
  expect(did_run).toEqual(true);
  expect(result).toEqual(undefined);
});
it('execute default subcommand', async () => {
  await expect(() => run_command_with_options({
    default: 'list',
  }, parse_argv(['example']), cfg)).rejects.toThrow('Implementation fault: default command list does not exist as a subcommand of example.');
});
it('resolves aliases for command', async () => {
  const result = await run_command_with_options({
    aliases: {
      a: 'alpha'
    },
    options: {
      alpha: 'an option',
    },
    action(opts) {
      expect(opts.options.has('alpha')).toBeTruthy();
    }
  }, parse_argv(['example', '-a']), cfg);
  expect(result).toEqual(undefined);
});
it('returns default exit code for successful action', async () => {
  const result = await run_command_with_options({
    parameters: 1,
    action() {
      // no-op
    }
  }, parse_argv(['example', 'arg']), cfg);
  expect(result).toEqual(undefined);
});
it('returns custom exit code for successful action', async () => {
  const result = await run_command_with_options({
    parameters: Infinity,
    action() {
      return 42;
    }
  }, parse_argv(['example', 'arg']), cfg);
  expect(result).toEqual(42);
});
it('handles a thrown error in an action', async () => {
  const result = await run_command_with_options({
    action() {
      throw new Error('BANG');
    }
  }, parse_argv(['example']), cfg);
  expect(result).toEqual(1);
  expect(std_error?.mock.calls).toEqual([
    [`${style.font_color.red`error`} - BANG\n`],
    ['\n']
  ]);
});
it('handles a thrown value in an action', async () => {
  const result = await run_command_with_options({
    action() {
      throw 'BANG';
    }
  }, parse_argv(['example']), cfg);
  expect(result).toEqual(1);
  expect(std_error?.mock.calls).toEqual([
    [`${style.font_color.red`error`} - 'BANG'\n`],
    ['\n']
  ]);
});
it('throws from an action if throw_errors is set', async () => {
  await expect(run_command_with_options({
    action() {
      throw 'BANG';
    }
  }, parse_argv(['example']), { ...cfg, throw_errors: true})).rejects.toEqual('BANG')
});
it('handles a misspelt subcommand', async () => {
  const result = await run_command_with_options({
    subcommands: {
      list: {}
    },
  }, parse_argv(['example', 'lost']), cfg);
  expect(result).toEqual(1);
  expect(std_error?.mock.calls.map(str => str[0].toString())).toEqual([
    '\'lost\' is not a example command. See \'example help\' for a list of available commands.\n',
    '\n',
    'Did you mean\n',
    '  example list\n',
    '\n',
  ]);
});
it('default help execution', async () => {
  const result = await run_command_with_options({}, parse_argv(['example']), cfg);
  expect(std_output?.mock.calls[0][0]).toEqual(`${style.bold`USAGE:`} example ${style.dim`[options]`}\n`);
  expect(result).toEqual(0);
});
it('validates command arity', async () => {
  let did_run = false;
  const result = await run_command_with_options({
    action () {
      did_run = true;
      // no-op
    },
    parameters: 1,
  }, parse_argv(['example', 'arg1', 'arg2']), cfg);

  expect(did_run).toBeFalsy();
  expect(result).toEqual(EXIT_CODE.error);
  expect(std_error?.mock.calls[0][0]).toEqual(`${style.font_color.red`error`} - ${style.bold`example`} expects up to 1 arguments but received 2.\n`);
});
it('accepts 0 arguments by default', async () => {
  let did_run = false;
  const result = await run_command_with_options({
    action () {
      did_run = true;
      // no-op
    },
  }, parse_argv(['example', 'arg1']), cfg);

  expect(did_run).toBeFalsy();
  expect(result).toEqual(EXIT_CODE.error);
  expect(std_error?.mock.calls[0][0]).toEqual(`${style.font_color.red`error`} - ${style.bold`example`} expects up to 0 arguments but received 1.\n`);
});
it('suggests a subcommand if subcommands are defined and there are too many arguments', async () => {
  let did_run = false;
  const result = await run_command_with_options({
    subcommands: {
      alpha: {},
    },
    action () {
      did_run = true;
      // no-op
    },
  }, parse_argv(['example', 'alfa']), cfg);

  expect(did_run).toBeFalsy();
  expect(result).toEqual(EXIT_CODE.error);
  expect(std_error?.mock.calls.map(str => str[0].toString())).toEqual([
    '\'alfa\' is not a example command. See \'example help\' for a list of available commands.\n',
    '\n',
    'Did you mean\n',
    '  example alpha\n',
    '\n',
  ]);
});
it('suggests a subcommand if subcommands are defined and there are too many arguments for the default subcommand', async () => {
  let did_run = false;
  const result = await run_command_with_options({
    subcommands: {
      alpha: {},
    },
    default: 'alpha',
    action () {
      did_run = true;
      // no-op
    },
  }, parse_argv(['example', 'alfa', 'beta']), cfg);

  expect(did_run).toBeFalsy();
  expect(result).toEqual(EXIT_CODE.error);
  expect(std_error?.mock.calls.map(str => str[0].toString())).toEqual([
    '\'alfa\' is not a example command. See \'example help\' for a list of available commands.\n',
    '\n',
    'Did you mean\n',
    '  example alpha\n',
    '\n',
  ]);
});
it('accepts arguments for a default subcommand', async () => {
  let did_run = false;
  
  const result = await run_command_with_options({
    subcommands: {
      alpha: {
        parameters: 1,
        action (opts) {
          expect(opts.arguments).toStrictEqual([ 'beta' ]);
          return 42;
        }
      },
    },
    default: 'alpha',
    action () {
      did_run = true;
      // no-op
    },
  }, parse_argv(['example', 'alpha', 'beta']), cfg);

  expect(did_run).toBeFalsy();
  expect(result).toBe(42);
});
it('strict_options reject extra options', async () => {
  const result = await run_command_with_options({
    action() {
      // no-op
    }
  }, parse_argv(['example', '--flag']), {
    ...cfg,
    strict_options: true,
  });
  expect(result).toEqual(1);
  expect(std_error?.mock.calls).toEqual([
    [`${style.font_color.red`error`} - Unrecognised option --flag\n`],
    ['\n']
  ]);
});
it('strict_options accepts defined options', async () => {
  const result = await run_command_with_options({
    action() {
      return 42;
    },
    options: {
      flag: 'some option'
    }
  }, parse_argv(['example', '--flag']), {
    ...cfg,
    strict_options: true,
  });
  expect(result).toEqual(42);
});