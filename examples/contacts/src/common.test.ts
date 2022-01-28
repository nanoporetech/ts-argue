import { get_existing_name, get_new_name } from './common';

let interactive = false;

jest.mock('ts-argue', () => ({
  style: {
    dim: (txt: string) => txt,
  },
  terminal: {
    get interactive() {
      return interactive;
    },
    select: jest.fn().mockResolvedValue('John Doe'),
    input: jest.fn().mockResolvedValue('Harold Townsend'),
    print_lines: jest.fn(),
  }
}));

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

afterEach(() => {
  interactive = false;
});

it('get_existing_name with argument', async () => {
  await expect(get_existing_name(['John Doe'])).resolves.toEqual('John Doe');
});

it('get_existing_name interactive', async () => {
  interactive = true;
  await expect(get_existing_name([])).resolves.toEqual('John Doe');
});

it('get_existing_name non-interactive', async () => {
  await expect(get_existing_name([])).rejects.toThrow('Please specify a contact name as an argument.');
});

it('get_existing_name invalid argument', async () => {
  await expect(get_existing_name(['Harold Townsend'])).rejects.toThrow('No contact exists with the name Harold Townsend.');
});

it('get_new_name with argument', async () => {
  await expect(get_new_name(['Harold Townsend'])).resolves.toEqual('Harold Townsend');
});

it('get_new_name interactive', async () => {
  interactive = true;
  await expect(get_new_name([])).resolves.toEqual('Harold Townsend');
});

it('get_new_name non-interactive', async () => {
  await expect(get_new_name([])).rejects.toThrow('Please specify a contact name as an argument.');
});

it('get_new_name invalid argument', async () => {
  await expect(get_new_name(['John Doe'])).rejects.toThrow('A contact already exists with the name John Doe.');
});