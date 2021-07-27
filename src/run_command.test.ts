import { assertDefined } from 'ts-runtime-typecheck';
import { run_command } from './run_command';

const exit = new Error('not a real error');

let process_exit: jest.SpiedFunction<typeof process.exit> | null = null;

beforeEach(() => {
  process_exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw exit; });
});
afterEach(() => {
  process_exit && process_exit.mockRestore();
  process_exit = null;
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

it('sync action default exit code', async () => {
  assertDefined(process_exit);
  process.argv = ['node', 'example'];

  try {
    await run_command({
      action () {
        // nada
      }
    }, { version: '1'});
  } catch {
    // test throws harmless error instead of calling process.exit
  }
  expect(process_exit.mock.calls).toEqual([
    [0],
  ]);
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