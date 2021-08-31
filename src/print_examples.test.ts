import { assertDefined } from 'ts-runtime-typecheck';
import { print_examples } from './print_examples';
import * as style from './style';

let std_output: jest.SpiedFunction<typeof process.stdout.write> | null = null;
beforeEach(() => {
  std_output = jest.spyOn(process.stdout, 'write');
});
afterEach(() => {
  std_output && std_output.mockRestore();
  std_output = null;
});

describe('prints_examples', () => {
  it('prints a simple list', () => {
    assertDefined(std_output);
    print_examples('example', {
      examples: [
        'two',
        'one',
      ]
    });
  
    expect(std_output.mock.calls.map(([str]) => str)).toEqual([
      `${style.dim`${'example'} ${'two'}`}\n`,
      `${style.dim`${'example'} ${'one'}`}\n`,
    ]);
  });
  it('prints a nested list', () => {
    assertDefined(std_output);
    print_examples('example', {
      examples: [
        'two',
        'one',
      ],
      subcommands: {
        sub: {
          examples: [
            'three'
          ],
          subcommands: {
            deep: {
              examples: [ '42' ]
            }
          }
        }
      }
    });
  
    expect(std_output.mock.calls.map(([str]) => str)).toEqual([
      `${style.dim`${'example'} ${'two'}`}\n`,
      `${style.dim`${'example'} ${'one'}`}\n`,
      `${style.dim`${'example sub'} ${'three'}`}\n`,
      `${style.dim`${'example sub deep'} ${'42'}`}\n`,
    ]);
  });
  it('prints a default subcommand example from current context', () => {
    assertDefined(std_output);
    print_examples('example', {
      default: 'sub',
      subcommands: {
        sub: {
          examples: [
            'three'
          ]
        }
      }
    });
  
    expect(std_output.mock.calls.map(([str]) => str)).toEqual([
      `${style.dim`${'example'} ${'three'}`}\n`,
      `${style.dim`${'example sub'} ${'three'}`}\n`,
    ]);
  });
  it('prints a blank example if has an action but no examples', () => {
    assertDefined(std_output);
    print_examples('example', {
      action () {
        return;
      }
    });
  
    expect(std_output.mock.calls.map(([str]) => str)).toEqual([
      `${style.dim`${'example'}`}\n`,
    ]);
  });
});