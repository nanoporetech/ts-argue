import { run_command_with_options, parse_argv } from 'ts-argue';
import { create_command } from './create_command';

jest.mock('./database', () => ({
  contact_database: {
    insert () {
      return Promise.resolve<void>(void 0);
    },
    get () {
      return Promise.resolve(null);
    },
    entries () {
      return Promise.resolve([]);
    },
    delete () {
      return Promise.resolve<void>(void 0);
    }
  }
}));

it('contacts create', async () => {
  await run_command_with_options(create_command, parse_argv(['contacts create', 'John Doe']), { throw_errors: true });
});