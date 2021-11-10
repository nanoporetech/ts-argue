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
  const options = new Map<string, string>([]);
  const exe_name = nice_executable_name(executable);

  const reverse_alias_lookup = new Map<string, string[]>([
    ['help', ['h']],
    ['version', ['v']],
  ]);

  if (command.aliases) {
    for (const [alias, option] of Object.entries(command.aliases)) {
      let set = reverse_alias_lookup.get(option);
      if (!set) {
        set = [];
        reverse_alias_lookup.set(option, set);
      }
      set.push(alias);
    }
  }

  // NOTE user specified commands have a higher precedence than the builtins
  // defined above, hence we allow these to override the builtins
  let longest_name = 7;
  if (command.subcommands) {
    for (const [ cmdname, cmd ] of Object.entries(command.subcommands)) {
      subcommands.set(cmdname, cmd.description ?? '');
      longest_name = Math.max(cmdname.length, longest_name);
    }
  }

  // TODO this probably doesn't do the right thing if a
  // user tries to override default option descriptions
  const sorted_option_list = [
    ['help', 'Output usage information'],
    ['version', 'Output the version number'],
    ...Object.entries(command.options ?? []),
  ].sort((a, b) => a[0] > b[0] ? 1 : -1);

  for (const [ option, description ] of sorted_option_list) {
    // construct the label from a list of aliases for the option
    const aliases = reverse_alias_lookup.get(option) ?? [];
    aliases.push(option);
    // change the prefix based on the alias length
    const label = aliases.map(a => a.length === 1 ? `-${a}` : `--${a}`).join(', ');
    options.set(label, description);
    longest_name = Math.max(label.length, longest_name);
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

  if (command.subcommands) {
    terminal.print_line(`${style.bold`USAGE:`} ${exe_name} ${style.dim`[options] [command]`}`);
  } else {
    const max_parameters = command.parameters ?? 0;
    if (max_parameters === Infinity) {
      terminal.print_line(`${style.bold`USAGE:`} ${exe_name} ${style.dim`[options] [...arguments]`}`);
    } else if (max_parameters > 0) {
      const parameters = [];
      for (let i = 0; i < max_parameters; i += 1) {
        parameters.push(` [arg${i + 1}]`);
      }
      terminal.print_line(`${style.bold`USAGE:`} ${exe_name} ${style.dim`[options]${parameters.join('')}`}`);
    } else {
      terminal.print_line(`${style.bold`USAGE:`} ${exe_name} ${style.dim`[options]`}`);
    }
  }
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
  terminal.print_lines(
    Array.from(options)
      .map(([name, description]) => `${`${name}`.padEnd(longest_name)} ${style.dim(description)}`)
  );
  end_group();
}