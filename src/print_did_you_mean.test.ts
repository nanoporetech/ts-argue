import { print_did_you_mean } from './print_did_you_mean';

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

it('prints fake is not a command', () => {
  print_did_you_mean({}, 'example', 'fake');
  expect(std_error?.mock.calls[0][0]).toEqual('\'fake\' is not a example command. See \'example help\' for a list of available commands.\n');
});

it('prints fake is not a command when no subcommands', () => {
  print_did_you_mean({
    subcommands: {}
  }, 'example', 'fake');
  expect(std_error?.mock.calls[0][0]).toEqual('\'fake\' is not a example command. See \'example help\' for a list of available commands.\n');
});

it('prints fake is not a command and lists closest similar', () => {
  print_did_you_mean({
    subcommands: {
      take: {}
    }
  }, 'example', 'fake');
  expect(std_error?.mock.calls[0][0]).toEqual('\'fake\' is not a example command. See \'example help\' for a list of available commands.\n');
  expect(std_error?.mock.calls[1][0]).toEqual('\n');
  expect(std_error?.mock.calls[2][0]).toEqual('Did you mean\n');
  expect(std_error?.mock.calls[3][0]).toEqual('  example take\n');
});