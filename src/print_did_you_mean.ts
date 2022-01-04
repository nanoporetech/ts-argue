import type { Command } from './Command.type';
import { terminal } from './Terminal';

import { nearest_string } from './nearest_string';

export function print_did_you_mean(command: Command, executable: string, subcommand_name: string): void {
  terminal
    .print_line(`'${subcommand_name}' is not a ${executable} command. See '${executable} help' for a list of available commands.`, 'stderr')
    .new_line('stderr');
  
  if (!command.subcommands) {
    return;
  }

  const subcommand_names = Object.keys(command.subcommands);
  if (subcommand_names.length === 0) {
    return;
  }

  const closest_command = nearest_string(subcommand_name, subcommand_names);
  terminal
    .print_line('Did you mean', 'stderr')
    .increase_indent()
    .print_line(`${executable} ${closest_command}`, 'stderr')
    .decrease_indent()
    .new_line('stderr');

  return;
}