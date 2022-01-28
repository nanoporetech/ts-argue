import { Command, run_command } from 'ts-argue';

import { create_command } from './create_command';
import { delete_command } from './delete_command';
import { list_command } from './list_command';
import { update_command } from './update_command';

/**
 * This is our root command, it doesn't define an action itself but
 * collects multiple subcommands to form our command tree.
 * 
 * Additionally it defines a default subcommand, so instead of printing
 * it's help text when called it will act as an alias to that subcommand.
 */
const root_command: Command = {
  description: 'My amazing contacts app',
  subcommands: {
    create: create_command,
    list: list_command,
    update: update_command,
    delete: delete_command
  },
  default: 'list'
};

void run_command(root_command, { version: '1', name: 'contacts' });