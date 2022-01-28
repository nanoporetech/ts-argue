import { run_command_with_options, parse_argv } from 'ts-argue';
import { delete_command } from './delete_command';

jest.mock('./database', () => ({
  contact_database: {
    insert () {
      return Promise.resolve<void>(void 0);
    },
    get () {
      return Promise.resolve(null);
    },
    entries () {
      return Promise.resolve([
        {
          name: 'John Doe'
        }
      ]);
    },
    delete () {
      return Promise.resolve<void>(void 0);
    }
  }
}));

it('contacts delete', async () => {
  await run_command_with_options(delete_command, parse_argv(['contacts delete', 'John Doe']), { throw_errors: true });
});