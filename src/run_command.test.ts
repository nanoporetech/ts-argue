import { assertDefined } from 'ts-runtime-typecheck';
import { run_command } from './run_command';
import { bold, dim } from './style';

const exit = new Error('not a real error');

let process_exit: jest.SpiedFunction<typeof process.exit> | null = null;
let std_output: jest.SpiedFunction<typeof process.stdout.write> | null = null;
let process_argv: string[] | null = null;

beforeEach(() => {
  process_exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw exit; });
  std_output = jest.spyOn(process.stdout, 'write');
  process_argv = process.argv;
});
afterEach(() => {
  process_exit && process_exit.mockRestore();
  std_output && std_output.mockRestore();
  assertDefined(process_argv);
  process.argv = process_argv;
});

it('sync action custom exit code', async () => {
  assertDefined(process_exit);
  process.argv = ['node', 'example'];
  // sync success
  try {
    await run_command({
      action () {
        return 42;
      }
    }, { version: '1'});
  } catch (e) {
    // test throws harmless error instead of calling process.exit
  }
  expect(process_exit.mock.calls).toEqual([
    [42],
  ]);
});

it('async action custom exit code', async () => {
  assertDefined(process_exit);
  process.argv = ['node', 'example'];
  try {
    await run_command({
      action () {
        return Promise.resolve(22);
      }
    }, { version: '1'});
  } catch {
    // test throws harmless error instead of calling process.exit
  }
  expect(process_exit.mock.calls).toEqual([
    [22],
  ]);
});

it('sync action doesn\'t exit', async () => {
  assertDefined(process_exit);
  process.argv = ['node', 'example'];

  try {
    await run_command({
      action () {
        // nada
      }
    });
  } catch {
    // test throws harmless error instead of calling process.exit
  }
  expect(process_exit.mock.calls.length).toEqual(0);
});

it('failing action default error exit code', async () => {
  assertDefined(process_exit);
  process.argv = ['node', 'example'];
  try {
    await run_command({
      action () {
        throw exit;
      }
    }, { version: '1'});
  } catch {
    // test throws harmless error instead of calling process.exit
  }
  expect(process_exit.mock.calls).toEqual([
    [1]
  ]);
});

it('uses the 2nd process arg for root executable', async () => {
  assertDefined(std_output);
  // use the version option to print the executable name
  process.argv = ['node', 'example', '--version'];
  try {
    await run_command({
      action () {
        null;
      }
    }, { version: '1' });
  } catch (e) {
    // test throws harmless error instead of calling process.exit
  }
  
  expect(std_output?.mock.calls[0][0]).toEqual(`${bold`example`} version 1\n`);
});

it('renames the root executable if specified in configuration', async () => {
  assertDefined(std_output);
  // use the version option to print the executable name
  process.argv = ['node', 'example', '--version'];
  try {
    await run_command({
      action () {
        null;
      }
    }, { version: '1', name: 'special' });
  } catch (e) {
    // test throws harmless error instead of calling process.exit
  }
  expect(std_output?.mock.calls[0][0]).toEqual(`${bold`special`} version 1\n`);
});

it('execute v option', async () => {
  // use the version option to print the executable name
  process.argv = ['node', 'example', '-v'];
  try {
    await run_command({}, { version: '1', name: 'special' });
  } catch {
    // test throws harmless error instead of calling process.exit
  }
  expect(std_output?.mock.calls[0][0]).toEqual(bold`special` + ' version 1\n');
});

it('execute h option', async () => {
  process.argv = ['node', 'example', '-h'];
  try {
    await run_command({}, { version: '1', name: 'special' });
  } catch {
    // test throws harmless error instead of calling process.exit
  }
  expect(std_output?.mock.calls[0][0]).toEqual(`${bold`USAGE:`} special ${dim`[options]`}\n`);
});