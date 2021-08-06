# ts-argue

![100% coverage](https://img.shields.io/badge/coverage-100%25-success)
![npm](https://img.shields.io/npm/dm/ts-argue)

An opinionated framework for creating modern CLI applications in Node.js, with a simple and composable approach to command definitions.

Whereas most CLI frameworks use the builder pattern for defining the behavior of the application ts-argue defines a pattern for a command object. These commands can then be composed into a tree of sub-commands to define your application. In addition to defining the application behavior this tree of commands auto-generates contextual help text and suggestions.

## Example

As an example lets create a simple CRUD application that stores contacts. We will have 5 sub-commands: create, read, list, update and delete. If we don't specify a sub-command we will list the contacts. This is what our application will look like.

```txt
> contacts create 'Jane Doe' --mobile '01234 567890' --email 'janedoe@unknown.com'
 
  Created new entry for 'Jane Doe'

> contacts read 'Jane Doe'
       
  Name: Jane Doe
  Mobile: 01234 567890
  Email: janedoe@unknown.com

> contacts list

  Contacts
  - Jane Doe

> contacts

  Contacts
  - Jane Doe

> contacts update 'Jane Doe' --name 'Jenny Doe' --mobile '01111 567890' --email 'jennydoe@unknown.com'

  Updated contact details for 'Jane Doe'

  Name: Jenny Doe
  Mobile: 01111 567890
  Email: jennydoe@unknown.com

> contacts delete 'Jenny Doe'

  Deleted contact 'Jenny Doe'
```

```typescript
import type { Argv, Command } from 'ts-argue';
import type { Contact } from './database';

// our actual storage and persistence will be dealt with outside of our UI layer 
import { contact_database } from './database';
import { read_string_option, run_command, terminal, style } from 'ts-argue';

// first we define each sub-command
// the create command has a few options, and requires an argument
const create_command: Command = {
  description: 'Create a new contact',
  options: {
    name: 'The name of the contact',
    mobile: 'The mobile number of the contact',
    email: 'The email address of the contact',
  },
  async action(opts) {
    const name = get_name_argument(opts);
    const { mobile, email } = read_standard_options(opts);
    await contact_database.insert({ name, mobile, email });
    terminal.print_line(`Created new entry for ${style.bold(name)}`);
  }
};

// the read command has no options, and requires an argument
const read_command: Command = {
  description: 'Read the details of a specific contact',
  async action(opts) {
    const name = get_name_argument(opts);
    const entry = await get_existing_contact(name);
    print_contact(entry);
  }
};

// the list command has no options, and take no arguments
const list_command: Command = {
  description: 'List all your contacts',
  async action() {
    const entries = await contact_database.entries();
    if (entries.length === 0) {
      terminal.print_line('No contacts found in database.');
      terminal.new_line();
      terminal.print_line('To learn how to create a new contact try:');
      terminal.increase_indent();
      terminal.print_line(style.bold('contacts create help'));
      terminal.new_line();

      return;
    }
    terminal.print_line(style.bold`CONTACTS:`);
    terminal.increase_indent();
    for (const entry of entries) {
      terminal.print_line(entry.name);
    }
  }
};

// the update command has a few options, and requires an argument
const update_command: Command = {
  description: 'Update the details for a contact',
  options: {
    name: 'A new name for the contact',
    mobile: 'A new mobile number of the contact',
    email: 'A new email address of the contact',
  },
  async action(opts) {
    const name = get_name_argument(opts);
    const { name: new_name, mobile, email } = read_standard_options(opts);

    const entry = await get_existing_contact(name);

    if (new_name) {
      await contact_database.delete(name);
    }

    const new_entry = {
      name: new_name || name,
      email: email || entry.email,
      mobile: mobile || entry.mobile,
    };

    await contact_database.insert(new_entry);

    terminal.print_line(`Updated contact details for ${style.bold(new_entry.name)}`);
    print_contact(new_entry);
  }
};

// the delete command has no options, and requires an argument
const delete_command: Command = {
  description: 'Delete a contact',
  async action(opts) {
    const name = get_name_argument(opts);
    await get_existing_contact(name);
    await contact_database.delete(name);
    terminal.print_line(`Deleted contact ${style.bold(name)}`);
  }
};

const get_name_argument = (opts: Argv) => {
  const name = opts.arguments[0];
  if (!name) {
    throw new Error('Expected a name');
  }
  return name;
};

const get_existing_contact = async (name: string) => {
  const entry = await contact_database.get(name);
  if (!entry) {
    throw new Error(`No entry found for '${name}'`);
  }
  return entry;
};

const read_standard_options = (opts: Argv) => {
  return {
    name: read_string_option(opts, 'name'),
    mobile: read_string_option(opts, 'mobile'),
    email: read_string_option(opts, 'email'),
  };
};

const print_contact = ({ name, email, mobile }: Contact) => {
  terminal.print_line(`${style.dim('Name:')} ${name}`);
  terminal.print_line(`${style.dim('Mobile:')} ${mobile ?? ''}`);
  terminal.print_line(`${style.dim('Email:')} ${email ?? ''}`);
};

// next we define our "root" command
// we specify our other commands as sub-commands, and indicate the default
// subcommand is 'list'
const root_command: Command = {
  description: 'My amazing contacts app',
  subcommands: {
    create: create_command,
    read: read_command,
    list: list_command,
    update: update_command,
    delete: delete_command
  },
  default: 'list'
};

// finally to actually execute our application we call run_command with our
// root command and our arguments. there is no need to trim the arguments
void run_command(root_command, { version: '1' });
```

You can try the above example by downloading this repo, installing the dev dependencies and running `npm run example` ( this uses ts-node so there is a bit of a delay which wouldn't be present in a production application ).

## Project Status

This library has only been used for proof of concepts at the moment, and is not considered complete. It is being developed side by side another project, and the aim is to produce a 1.0.0 release around the time that project is complete.
