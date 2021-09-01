import { nice_executable_name } from './Argv';
import type { Command } from './Command.type';
import { terminal } from './Terminal';

import * as style from './style';
import { print_examples, will_print_examples } from './print_examples';

export function print_help(executable: string, command: Command): void {
  const subcommands = new Map([
    ['help', 'Display help'],
    ['version', 'Display version'],
  ]);
  const options = new Map([
    ['help', 'Output usage information'],
    ['version', 'Output the version number'],
  ]);
  const exe_name = nice_executable_name(executable);

  // NOTE user specified commands have a higher precedence than the builtins
  // defined above, hence we allow these to override the builtins
  let longest_name = 7;
  if (command.subcommands) {
    for (const [ cmdname, cmd ] of Object.entries(command.subcommands)) {
      subcommands.set(cmdname, cmd.description ?? '');
      longest_name = Math.max(cmdname.length, longest_name);
    }
  }

  longest_name = Math.max(longest_name, 9);
  if (command.options) {
    for (const [ option, description ] of Object.entries(command.options)) {
      options.set(option, description);
      longest_name = Math.max(option.length + 2, longest_name);
    }
  }

  if (command.description) {
    terminal.print_line(command.description);
    terminal.new_line();
  }

  const start_group = (label: string) => {
    terminal.print_line(style.bold(label.toUpperCase() + ':'));
    terminal.increase_indent();
  };
  const end_group = () => {
    terminal.decrease_indent();
    terminal.new_line();
  };

  terminal.print_line(`${style.bold`USAGE:`} ${exe_name} ${style.dim`[options] [command]`}`);
  terminal.new_line();

  // NOTE this used to be optional based on if examples existed
  // in the command but it's harder to tell now with the recursive
  // printing. So we now use an helper
  if (will_print_examples(command)) {
    start_group('examples');
    print_examples(exe_name, command);
    end_group();
  }

  start_group('commands');
  // NOTE we want to alphabetically sort and format the subcommands into something nice
  terminal.print_lines(
    Array.from(subcommands)
      .sort((a, b) => a[0] > b[0] ? 1 : -1)
      .map(([name, description]) => `${name.padEnd(longest_name)} ${style.dim(description)}`)
  );
  end_group();

  start_group('options');
  // NOTE we want to alphabetically sort and format the subcommands into something nice
  terminal.print_lines(
    Array.from(options)
      .sort((a, b) => a[0] > b[0] ? 1 : -1)
      .map(([name, description]) => `${`--${name}`.padEnd(longest_name)} ${style.dim(description)}`)
  );
  end_group();
}