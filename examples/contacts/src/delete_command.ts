import { Command, style, terminal } from 'ts-argue';
import { get_existing_name } from './common';
import { contact_database } from './database';

/**
 * contacts delete $CONTACT_NAME
 * 
 * Deletes an existing contact with a given name.
 * 
 * The name can be provided as an argument, or provided interactively.
 * An interactive prompt will only be shown if the name is not given as an argument
 * and the command was run in a suitable interactive terminal environment.
 * 
 * Once the command has been run a confirmation of the deleted contact will appear.
 */
export const delete_command: Command = {
  description: 'Delete a contact',
  examples: [
    '$CONTACT_NAME',
    ''
  ],
  parameters: 1,
  async action(opts) {
    const name = await get_existing_name(opts.arguments);
    await contact_database.delete(name);
    
    terminal.print_line(`Deleted contact ${style.bold(name)}`);
  }
};