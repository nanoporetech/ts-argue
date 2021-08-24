import { nice_executable_name } from './Argv';
import type { Command } from './Command.type';
import { terminal } from './Terminal';

import { nearest_string } from './nearest_string';

export function print_did_you_mean(command: Command, executable: string, subcommand_name: string): void {
  const exe_name = nice_executable_name(executable);
  terminal.print_line(`'${subcommand_name}' is not a ${exe_name} command. See '${exe_name} help' for a list of available commands.`);
  terminal.new_line();
  if (!command.subcommands) {
    return;
  }

  const subcommand_names = Object.keys(command.subcommands);
  if (subcommand_names.length === 0) {
    return;
  }

  const closest_command = nearest_string(subcommand_name, subcommand_names);
  terminal.print_line('Did you mean');
  terminal.increase_indent();
  terminal.print_line(`${exe_name} ${closest_command}`);
  terminal.decrease_indent();
  terminal.new_line();

  return;
}