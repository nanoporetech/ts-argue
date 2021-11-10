import type { Argv } from './Argv.type';

import { nice_executable_name, parse_argv, read_boolean_option, read_numerical_array_option, read_numerical_option, read_string_array_option, read_string_option, remove_executable, rename_executable, rename_executable_and_remove_subcommmand, resolve_aliases, root_executable } from './Argv';

it('rename_executable', () => {
  const source: Argv = {
    options: new Map,
    arguments: ['cake', 'vanilla'],
  };
  const result = rename_executable(source, 'flapjack');
  expect(result.arguments).toEqual([ 'flapjack', 'vanilla' ]);
});
it('root_executable', () => {
  expect(root_executable('cake-vanilla-sponge')).toEqual('cake');
});
it('nice_executable_name', () => {
  expect(nice_executable_name('cake-vanilla-sponge')).toEqual('cake vanilla sponge');
});
it('rename_executable_and_remove_subcommmand', () => {
  const source: Argv = {
    options: new Map,
    arguments: ['cake', 'vanilla'],
  };
  const result = rename_executable_and_remove_subcommmand(source, 'cake-vanilla');
  expect(result.arguments).toEqual([ 'cake-vanilla' ]);
});
it('remove_executable', () => {
  const source: Argv = {
    options: new Map,
    arguments: ['cake', 'vanilla'],
  };
  const result = remove_executable(source);
  expect(result.arguments).toEqual([ 'vanilla' ]);
});
it('resolve_aliases', () => {
  const source: Argv = {
    options: new Map([
      ['a', ['1', '2', '4']],
      ['b', ['hello']],
      ['alpha', ['8']],
    ]),
    arguments: ['cake', 'vanilla'],
  };
  const { options, arguments: args } = resolve_aliases(source, { a: 'alpha', b: 'beta' });
  expect(Array.from(options.entries())).toEqual([
    ['alpha', ['1', '2', '4', '8']],
    ['beta', ['hello']],
  ]);
  expect(args).toEqual([ 'cake', 'vanilla' ]);
});
describe('parse_argv', () => {
  it('just excutable', () => {
    const { options, arguments: args } = parse_argv(['cake']);
    expect(options.size).toBe(0);
    expect(args).toEqual([ 'cake' ]);
  });
  it('executable with arguments', () => {
    const { options, arguments: args } = parse_argv(['cake', 'vanilla', 'sponge']);
    expect(options.size).toBe(0);
    expect(args).toEqual([ 'cake', 'vanilla', 'sponge' ]);
  });
  it('executable with flags', () => {
    const { options, arguments: args } = parse_argv(['cake', '-ab', 'sponge', '-c', '-d=12']);
    expect(Array.from(options.entries())).toEqual([
      ['a', ['true']],
      ['b', ['sponge']],
      ['c', ['true']],
      ['d', ['12']]
    ]);
    expect(args).toEqual([ 'cake' ]);
  });
  it('executable with options', () => {
    const { options, arguments: args } = parse_argv(['cake', '--a', 'sponge', '--b', '-c', 'vanilla', '--delta=12', '--a', 'ice cream']);
    expect(Array.from(options.entries())).toEqual([
      ['a', ['sponge', 'ice cream']],
      ['b', ['true']],
      ['c', ['vanilla']],
      ['delta', ['12']]
    ]);
    expect(args).toEqual([ 'cake' ]);
  });
});
describe('read_option', () => {
  const source: Argv = {
    options: new Map,
    arguments: [],
  };
  source.options.set('a', ['yes']);
  source.options.set('b', ['no']);
  source.options.set('c', ['true']);
  source.options.set('d', ['false']);
  source.options.set('e', ['12']);
  source.options.set('f', ['ye']);
  source.options.set('g', ['4four']);
  source.options.set('h', ['12', '42']);
  source.options.set('i', ['hello', 'world']);

  it('read_boolean_option', () => {
    expect(read_boolean_option(source, 'a')).toEqual(true);
    expect(read_boolean_option(source, 'b')).toEqual(false);
    expect(read_boolean_option(source, 'c')).toEqual(true);
    expect(read_boolean_option(source, 'd')).toEqual(false);
    expect(() => read_boolean_option(source, 'e')).toThrow(`Expected boolean value for option ${'e'} but found ${12}`);
    expect(() => read_boolean_option(source, 'f')).toThrow(`Expected boolean value for option ${'f'} but found ${'ye'}`);
    expect(() => read_boolean_option(source, 'g')).toThrow(`Expected boolean value for option ${'g'} but found ${'4four'}`);
    expect(() => read_boolean_option(source, 'h')).toThrow(`Multiple values given for option ${'h'}`);
    expect(() => read_boolean_option(source, 'i')).toThrow(`Multiple values given for option ${'i'}`);
    expect(read_boolean_option(source, 'missing', true)).toEqual(true);
    expect(read_boolean_option(source, 'missing', false)).toEqual(false);
  });
  it('read_string_option', () => {
    expect(read_string_option(source, 'a')).toEqual('yes');
    expect(read_string_option(source, 'b')).toEqual('no');
    expect(read_string_option(source, 'c')).toEqual('true');
    expect(read_string_option(source, 'd')).toEqual('false');
    expect(read_string_option(source, 'e')).toEqual('12');
    expect(read_string_option(source, 'f')).toEqual('ye');
    expect(read_string_option(source, 'g')).toEqual('4four');
    expect(read_string_option(source, 'missing', 'alpha')).toEqual('alpha');
    expect(read_string_option(source, 'missing', '')).toEqual('');
    expect(() => read_string_option(source, 'h')).toThrow(`Multiple values given for option ${'h'}`);
    expect(() => read_string_option(source, 'i')).toThrow(`Multiple values given for option ${'i'}`);
  });
  it('read_string_array_option', () => {
    expect(read_string_array_option(source, 'a')).toEqual(['yes']);
    expect(read_string_array_option(source, 'b')).toEqual(['no']);
    expect(read_string_array_option(source, 'c')).toEqual(['true']);
    expect(read_string_array_option(source, 'd')).toEqual(['false']);
    expect(read_string_array_option(source, 'e')).toEqual(['12']);
    expect(read_string_array_option(source, 'f')).toEqual(['ye']);
    expect(read_string_array_option(source, 'g')).toEqual(['4four']);
    expect(read_string_array_option(source, 'missing')).toEqual([]);
    expect(read_string_array_option(source, 'h')).toEqual(['12', '42']);
    expect(read_string_array_option(source, 'i')).toEqual(['hello', 'world']);
  });
  it('read_numerical_array_option', () => {
    expect(() => read_numerical_array_option(source, 'a')).toThrow(`Expected numerical values for option ${'a'} but found ${'yes'}`);
    expect(() => read_numerical_array_option(source, 'b')).toThrow(`Expected numerical values for option ${'b'} but found ${'no'}`);
    expect(() => read_numerical_array_option(source, 'c')).toThrow(`Expected numerical values for option ${'c'} but found ${'true'}`);
    expect(() => read_numerical_array_option(source, 'd')).toThrow(`Expected numerical values for option ${'d'} but found ${'false'}`);
    expect(read_numerical_array_option(source, 'e')).toEqual([12]);
    expect(() => read_numerical_array_option(source, 'f')).toThrow(`Expected numerical values for option ${'f'} but found ${'ye'}`);
    expect(read_numerical_array_option(source, 'h')).toEqual([12, 42]);
    expect(() => read_numerical_array_option(source, 'i')).toThrow(`Expected numerical values for option ${'i'} but found ${'hello'}`);
    // WARN this should throw, but it isn't because of a bug in ts-runtime-typecheck
    // expect(() => read_numerical_array_option(source, 'g')).toThrow(`Expected numerical values for option ${'g'} but found ${'4four'}`);
    expect(read_numerical_array_option(source, 'missing')).toEqual([]);
    expect(read_numerical_array_option(source, 'missing')).toEqual([]);
  });
  it('read_number_option', () => {
    expect(() => read_numerical_option(source, 'a')).toThrow(`Expected numerical value for option ${'a'} but found ${'yes'}`);
    expect(() => read_numerical_option(source, 'b')).toThrow(`Expected numerical value for option ${'b'} but found ${'no'}`);
    expect(() => read_numerical_option(source, 'c')).toThrow(`Expected numerical value for option ${'c'} but found ${'true'}`);
    expect(() => read_numerical_option(source, 'd')).toThrow(`Expected numerical value for option ${'d'} but found ${'false'}`);
    expect(read_numerical_option(source, 'e')).toEqual(12);
    expect(() => read_numerical_option(source, 'f')).toThrow(`Expected numerical value for option ${'f'} but found ${'ye'}`);
    expect(() => read_numerical_option(source, 'h')).toThrow(`Multiple values given for option ${'h'}`);
    expect(() => read_numerical_option(source, 'i')).toThrow(`Multiple values given for option ${'i'}`);
    // WARN this should throw, but it isn't because of a bug in ts-runtime-typecheck
    // expect(() => read_numerical_option(source, 'g')).toThrow(`Expected numerical value for option ${'g'} but found ${'4four'}`);
    expect(read_numerical_option(source, 'missing', 12)).toEqual(12);
    expect(read_numerical_option(source, 'missing', 0)).toEqual(0);
  });
});
