import { parse_argv } from './Argv';
import { validate_options } from './validate_options';

describe('validate_options', () => {
  it('rejects unspecified options', () => {
    expect(() => validate_options({}, parse_argv(['example', '--invalid_flag']))).toThrow('Unrecognised option --invalid_flag');
  });
  it('pluralises the error when more than 1 invalid option is passed', () => {
    expect(() => validate_options({}, parse_argv(['example', '--invalid_flag', '--other_flag']))).toThrow('Unrecognised options --invalid_flag --other_flag');
  });
  it('accepts defined options', () => {
    expect(validate_options({
      options: {
        valid_flag: '',
        other_flag: '',
      }
    }, parse_argv(['example', '--valid_flag', '--other_flag'])));
  });
});