import { print_version } from './print_version';
import { bold } from './style';

let std_output: jest.SpiedFunction<typeof process.stdout.write> | null = null;
beforeEach(() => {
  std_output = jest.spyOn(process.stdout, 'write');
});
afterEach(() => {
  std_output && std_output.mockRestore();
});

it('prints the version', () => {
  print_version('example', { version: '42' });
  expect(std_output?.mock.calls[0][0]).toEqual(`${bold`example`} version 42\n`);
});