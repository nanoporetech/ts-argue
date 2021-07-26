// eslint-disable-next-line no-unused-vars
import { parse_argv } from './Argv';
import { run_command_with_options } from './run_command_with_options';

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
  await run_command_with_options({
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
});
it('execute help subcommand', async () => {
  await run_command_with_options({}, parse_argv(['example', 'help']), cfg);
  // eslint-disable-next-line no-control-regex
  expect(std_output?.mock.calls[0][0]).toMatch(/^\u001b\[1mUSAGE:\u001b\[22m example/u);
});
it('execute help option', async () => {
  await run_command_with_options({}, parse_argv(['example', '--help']), cfg);
  // eslint-disable-next-line no-control-regex
  expect(std_output?.mock.calls[0][0]).toMatch(/^\u001b\[1mUSAGE:\u001b\[22m example/u);
});
it('help of subcommand preferred', async () => {
  await run_command_with_options({
    subcommands: {
      sub: {}
    }
  }, parse_argv(['example', 'sub', 'help']), cfg);
  // eslint-disable-next-line no-control-regex
  expect(std_output?.mock.calls[0][0]).toMatch(/^\u001b\[1mUSAGE:\u001b\[22m example sub/u);
});
it('execute version subcommand', async () => {
  await run_command_with_options({}, parse_argv(['example', 'version']), cfg);
  // eslint-disable-next-line no-control-regex
  expect(std_output?.mock.calls[0][0]).toEqual('\u001b[1mexample\u001b[22m version 1');
});
it('execute version option', async () => {
  await run_command_with_options({}, parse_argv(['example', '--version']), cfg);
  // eslint-disable-next-line no-control-regex
  expect(std_output?.mock.calls[0][0]).toEqual('\u001b[1mexample\u001b[22m version 1');
});
/*
test default subcommand execution
test default subcommand not existing
test action execution default exit code
test action execution custom exit code
test action execution thrown error
test action execution thrown non errr
test subcommand spelling error
test default help execution
*/