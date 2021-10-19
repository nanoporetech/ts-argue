import { parse_argv } from './Argv';
import { run_command_with_options } from './run_command_with_options';
import * as style from './style';

const cfg = { version: '1' };

let std_output: jest.SpiedFunction<typeof process.stdout.write> | null = null;

beforeEach(() => {
  std_output = jest.spyOn(process.stdout, 'write');
});
afterEach(() => {
  std_output && std_output.mockRestore();
  std_output = null;
});

it('execute subcommand', async () => {
  let did_run = false;
  const result = await run_command_with_options({
    subcommands: {
      test: {
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
  expect(std_output?.mock.calls[0][0]).toEqual(`${style.bold`USAGE:`} example ${style.dim`[options] [command]`}\n`);
  expect(result).toEqual(0);
});
it('execute help option', async () => {
  const result = await run_command_with_options({}, parse_argv(['example', '--help']), cfg);
  expect(std_output?.mock.calls[0][0]).toEqual(`${style.bold`USAGE:`} example ${style.dim`[options] [command]`}\n`);
  expect(result).toEqual(0);
});
it('help of subcommand preferred', async () => {
  const result = await run_command_with_options({
    subcommands: {
      sub: {}
    }
  }, parse_argv(['example', 'sub', 'help']), cfg);
  expect(std_output?.mock.calls[0][0]).toEqual(`${style.bold`USAGE:`} example sub ${style.dim`[options] [command]`}\n`);
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
it('returns default exit code for successful action', async () => {
  const result = await run_command_with_options({
    action() {
      // no-op
    }
  }, parse_argv(['example', 'arg']), cfg);
  expect(result).toEqual(undefined);
});
it('returns custom exit code for successful action', async () => {
  const result = await run_command_with_options({
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
  expect(std_output?.mock.calls).toEqual([
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
  expect(std_output?.mock.calls).toEqual([
    [`${style.font_color.red`error`} - 'BANG'\n`],
    ['\n']
  ]);
});
it('handles a misspelt subcommand', async () => {
  const result = await run_command_with_options({
    subcommands: {
      list: {}
    },
  }, parse_argv(['example', 'lost']), cfg);
  expect(result).toEqual(1);
  expect(std_output?.mock.calls.map(str => str[0].toString())).toEqual([
    '\'lost\' is not a example command. See \'example help\' for a list of available commands.\n',
    '\n',
    'Did you mean\n',
    '  example list\n',
    '\n',
  ]);
});
it('default help execution', async () => {
  const result = await run_command_with_options({}, parse_argv(['example']), cfg);
  expect(std_output?.mock.calls[0][0]).toEqual(`${style.bold`USAGE:`} example ${style.dim`[options] [command]`}\n`);
  expect(result).toEqual(0);
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
  expect(std_output?.mock.calls).toEqual([
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