import { Command, run_command } from 'ts-argue';
import { color_command } from './color_command';
import { modification_command } from './modifier_command';

/**
 * This is our root command, it doesn't define an action itself but
 * collects multiple subcommands to form our command tree.
 */
const root_command: Command = {
  description: 'ANSI styles example',
  subcommands: {
    colors: color_command,
    modifiers: modification_command,
  },
};

void run_command(root_command, { version: '1', name: 'styles' });