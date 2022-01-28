# Contacts Application

This is an example of a simple CRUD application made with ts-argue. It's composed of 4 leaf commands and 1 root command that collects them.

```txt
┏━━━━━━━━━━┓
┃ contacts ┃
┗━┯━━━━━━━━┛
  │   ┌────────┐
  ├─▶ │ create │ $CONTACT_NAME --mobile $MOBILE_NUMBER --email $EMAIL_ADDRESS
  │   ╞════════╡
  ├─▶ │ update │ $CONTACT_NAME --mobile $MOBILE_NUMBER --email $EMAIL_ADDRESS
  │   ╞════════╡
  ├─▶ │ list   │
  │   ╞════════╡
  └─▶ │ delete │ $CONTACT_NAME
      └────────┘
```

In code we create this by defining our leaf nodes. For each we:

- Indicate how many parameters it takes ( if any ) using the `parameters` property.
- List each option ( if any ) and give them a description using the `options` property.
- Provide a function using the `action` property that will be executed for that command when it is run.

```ts
import type { Command } from 'ts-argue';

const create_command: Command = {
  parameters: 1,
  options: {
    mobile: 'Contacts mobile number (optional)',
    email: 'Contacts email address (optional)'
  },
  action (options) {
    // [ create contact ]
  }
}
```

Then we compose them into a single tree by defining our root node. As this command has no action we don't need to specify any options or parameters. Each subcommand is specified via the `subcommands` property which maps a name to a command. For convenience we also specify a _default subcommand_ using the `default` property. This means that running `contacts` will have the same effect as `contacts list` instead of just printing a help message.

```ts
const contacts_command: Command = {
  subcommands: {
    create: create_command,
    update: update_command,
    list:   list_command,
    delete: delete_command
  },
  default: 'list'
}
```

You do not need to specify a default subcommand for your branch commands, if they have no `default` or `action` property a command will display it's help text when executed instead. It's also possible to define an `action` instead of a default subcommand for your branch commands, if that suits your application. Perhaps you want to display a special interactive wizard or show a welcome guide? Just don't mix actions and default subcommands, they are exclusive as running a command cannot have 2 effects.

## Building this example

First ensure that you have downloaded the **complete ts-argue repository**. From the project root you can run:

```sh
npm i && npm run build/contacts-example
```

This will install the dev dependencies for the project and compile this example to a single JS file within the `examples/contacts/dist` folder that can be run with node.

```sh
node examples/contacts/dist/contacts
```

After any edits just run `npm run build/contacts-example` again to rebuild the example. Please note that this example relies on project dependencies within node_modules, and will not work if copied to another location outside of the project. You will need to bundle all of your dependencies into a single file for that, or use npm to install the dependencies in-situ before running the example.

## Dirty database

This example uses a very simple method of persisting the contacts, they are saved to a JSON file in the current working directory called `my_contacts.json`. The code that does this is within [database.ts](./src/database.ts). It's only meant to facilitate the rest of the example, and isn't necessarily the best way to store this sort of information!
