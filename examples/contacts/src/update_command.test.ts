import { run_command_with_options, parse_argv } from 'ts-argue';
import { update_command } from './update_command';

jest.mock('./database', () => ({
  contact_database: {
    insert () {
      return Promise.resolve<void>(void 0);
    },
    get () {
      return Promise.resolve({
        name: 'John Doe'
      });
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

it('contacts update "John Doe"', async () => {
  await expect(
    () => run_command_with_options(
      update_command,
      parse_argv(['contacts update', 'John Doe']),
      { throw_errors: true }
    )
  ).rejects.toThrow('No fields to change');
});

it('contacts update "John Doe" --mobile=01234567890', async () => {
  await run_command_with_options(update_command, parse_argv(['contacts update', 'John Doe', '--mobile=01234567890']), { throw_errors: true });
});

it('contacts update "John Doe" --email=other@thing.org', async () => {
  await run_command_with_options(update_command, parse_argv(['contacts update', 'John Doe', '--email=other@thing.org']), { throw_errors: true });
});