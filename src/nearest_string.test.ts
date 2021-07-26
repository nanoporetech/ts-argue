import { nearest_string } from './nearest_string';

it('returns an empty string if no options', () => {
  expect(nearest_string('alpha', [])).toEqual('');
});
it('returns closest match', () => {
  expect(nearest_string('alp', ['alpha', 'beta', 'charlie'])).toEqual('alpha');
});