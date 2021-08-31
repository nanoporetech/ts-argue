import type { Command } from './Command.type';
import { dim } from './style';
import { terminal } from './Terminal';

export function print_examples (exe_name: string, command: Command): void {

  if (command.examples) {
    for (const example of command.examples) {
      terminal.print_line(dim`${exe_name} ${example}`);
    }
  }
  // NOTE if no examples are included, but there is an action
  // we insert a standard "no options" style example
  else if (command.action) {
    terminal.print_line(dim`${exe_name}`);
  }

  // NOTE if we have a default command then print all of that commands
  // example from this context
  if (command.subcommands && command.default) {
    const default_subcommand = command.subcommands[command.default];
    print_examples(exe_name, default_subcommand);
  }
  // NOTE recursively print the examples of the subcommands
  // with the correct prefix
  if (command.subcommands) {
    for (const [name, subcommand] of Object.entries(command.subcommands)) {
      print_examples(`${exe_name} ${name}`, subcommand);
    }
  }
}