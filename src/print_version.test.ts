import { print_version } from './print_version';

let std_output: jest.SpiedFunction<typeof process.stdout.write> | null = null;
beforeEach(() => {
  std_output = jest.spyOn(process.stdout, 'write');
});
afterEach(() => {
  std_output && std_output.mockRestore();
  std_output = null;
});

it('prints the version', () => {
  print_version('example', { version: '42' });
  expect(std_output?.mock.calls[0][0]).toEqual('\u001b[1mexample\u001b[22m version 42\n');
});