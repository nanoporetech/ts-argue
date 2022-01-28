import { run_command_with_options, parse_argv } from 'ts-argue';
import type { Contact } from './database.type';
import { list_command } from './list_command';

let entries: Contact[] = [];

jest.mock('./database', () => ({
  contact_database: {
    insert () {
      return Promise.resolve<void>(void 0);
    },
    get () {
      return Promise.resolve(null);
    },
    entries () {
      return Promise.resolve(entries);
    },
    delete () {
      return Promise.resolve<void>(void 0);
    }
  }
}));

afterEach(() => {
  entries = [];
});

describe('contacts list', () => {
  it('empty list', async () => {
    await run_command_with_options(list_command, parse_argv(['contacts list']), { throw_errors: true });
  });
  it('populated list', async () => {
    entries = [{
      name: 'John Doe'
    }];
    await run_command_with_options(list_command, parse_argv(['contacts list']), { throw_errors: true });
  });
});