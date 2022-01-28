import type { Command } from 'ts-argue';
import { get_new_name, print_contact } from './common';
import { contact_database } from './database';

/**
 * contacts create $CONTACT_NAME --mobile $MOBILE_NUMBER --email $EMAIL_ADDRESS
 * 
 * Creates a new contact with a given name, which optionally includes a mobile number
 * and email address.
 * 
 * The name can be provided as an argument, or provided interactively.
 * An interactive prompt will only be shown if the name is not given as an argument
 * and the command was run in a suitable interactive terminal environment.
 * 
 * Values for email and mobile can be passed as options, and are _optional_.
 * 
 * Shorthand aliases are provided for both the email and mobile options.
 * 
 * Once the command has been run the newly created contact will be printed.
 */
export const create_command: Command = {
  description: 'Create a new contact',
  options: {
    mobile: 'The mobile number of the contact',
    email: 'The email address of the contact',
  },
  aliases: {
    m: 'mobile',
    e: 'email'
  },
  examples: [
    '$CONTACT_NAME --mobile $MOBILE_NUMBER --email $EMAIL_ADDRESS',
    '$CONTACT_NAME',
    ''
  ],
  parameters: 1,
  async action(opts) {
    const name = await get_new_name(opts.arguments);

    const mobile = opts.string('mobile');
    const email = opts.string('email');

    await contact_database.insert({ name, mobile, email });

    print_contact({ name, mobile, email });
  }
};