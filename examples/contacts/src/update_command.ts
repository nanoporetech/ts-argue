import { Command, style, terminal } from 'ts-argue';
import { assertDefined } from 'ts-runtime-typecheck';
import { get_existing_name, print_contact } from './common';
import { contact_database } from './database';

/**
 * contacts update $CONTACT_NAME --mobile $MOBILE_NUMBER --email $EMAIL_ADDRESS
 * 
 * Update an existing contact with a given name, replacing the mobile number and/or
 * email address with a new value.
 * 
 * The name can be provided as an argument, or provided interactively.
 * An interactive prompt will only be shown if the name is not given as an argument
 * and the command was run in a suitable interactive terminal environment.
 * 
 * Values for email and mobile can be passed as options; they are optional but at
 * least 1 needs to be specified.
 * 
 * Shorthand aliases are provided for both the email and mobile options.
 * 
 * Once the command has been run a confirmation of the modification will be printed
 * as well as the revised contact.
 */
export const update_command: Command = {
  description: 'Update the details for a contact',
  options: {
    mobile: 'A new mobile number of the contact',
    email: 'A new email address of the contact',
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
    const name = await get_existing_name(opts.arguments);
    const new_email = opts.string('email');
    const new_mobile = opts.string('mobile');

    if (new_email === null && new_mobile === null) {
      terminal.print_line(`Please specify a revised email address or mobile number using the ${style.bold`--email`} and ${style.bold`--mobile`} options`);
      throw new Error('No fields to change');
    }

    const contact = await contact_database.get(name);

    assertDefined(contact);

    const new_entry = {
      name,
      email: new_email || contact.email,
      mobile: new_mobile || contact.mobile,
    };

    await contact_database.insert(new_entry);

    terminal.print_line(`Updated contact details for ${style.bold(new_entry.name)}`);
    print_contact(new_entry);
  }
};