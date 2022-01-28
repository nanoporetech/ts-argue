import { style, terminal } from 'ts-argue';
import { contact_database } from './database';
import type { Contact } from './database.type';


/**
 * Interprets the first argument as a contact name and ensures that a contact
 * exists with that name.
 * 
 * If no argument is passed and the terminal is in interactive mode an autocompletion
 * prompt is shown for the contact name.
 */
export const get_existing_name = async (args: string[]): Promise<string> => {
  const contact_name = args[0];
  const contacts = (await contact_database.entries()).map(({ name }) => name);

  if (terminal.interactive && !contact_name) {
    return terminal.select('Select contact', contacts, 'autocomplete');
  }
  
  if (!contact_name) {
    throw new Error('Please specify a contact name as an argument.');
  }

  if (!contacts.some(name => name === contact_name)) {
    throw new Error(`No contact exists with the name ${contact_name}.`);
  }

  return contact_name;
};

/**
 * Interprets the first argument as a contact name and ensures that no contact
 * exists with that name.
 * 
 * If no argument is passed and the terminal is in interactive mode an text input
 * prompt is shown for the new contact name.
 */
export const get_new_name = async (args: string[]): Promise<string> => {
  let contact_name = args[0];
  const contacts = (await contact_database.entries()).map(({ name }) => name);

  if (!terminal.interactive && !contact_name) {
    throw new Error('Please specify a contact name as an argument.');
  }

  if (!contact_name) {
    contact_name = await terminal.input('Contact name');
  }

  if (contacts.some(name => name === contact_name)) {
    throw new Error(`A contact already exists with the name ${contact_name}.`);
  }
  
  return contact_name;
};


/**
 * Prints a complete description of a contact
 */
export const print_contact = ({ name, email, mobile }: Contact) => {
  terminal.print_lines([
    `${style.dim('Name:')} ${name}`,
    `${style.dim('Mobile:')} ${mobile ?? ''}`,
    `${style.dim('Email:')} ${email ?? ''}`
  ]);
};