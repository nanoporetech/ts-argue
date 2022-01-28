import { Command, style, terminal } from 'ts-argue';
import { contact_database } from './database';

/**
 * contacts list
 * 
 * List all the contacts in the database in a nicely formatted table which
 * includes the name, mobile number and email address in separate columns.
 * 
 * No arguments or options are accepted.
 * 
 * If no contacts exist then a helpful message will be printed telling you
 * how to create one.
 */
export const list_command: Command = {
  description: 'List all your contacts',
  async action() {
    const entries = await contact_database.entries();
    
    if (entries.length === 0) {
      terminal
        .print_line('No contacts found in database.')
        .new_line()
        .print_line('To learn how to create a new contact try:')
        .increase_indent()
        .print_line(style.bold`contacts create help`)
        .new_line();

      return;
    }
    
    terminal.print_table(entries.map(({ name, mobile, email }) => [
      name,
      mobile ?? '',
      email ?? ''
    ]), ['Name', 'Mobile', 'Email']);
  }
};