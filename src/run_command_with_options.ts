
import type { Command } from './Command.type';
import type { Configuration } from './Configuration.type';
import type { Argv } from './Argv.type';

import { basename } from 'path';
import { print_did_you_mean } from './print_did_you_mean';
import { print_help } from './print_help';
import { print_version } from './print_version';
import { remove_executable, rename_executable, rename_executable_and_remove_subcommmand, resolve_aliases, root_executable } from './Argv';
import { EXIT_CODE } from './exit_code.constants';
import { terminal } from './Terminal';
import { bold, font_color } from './style';
import { validate_options } from './validate_options';

import util from 'util';

export async function run_command_with_options (command: Command, opts: Argv, cfg: Configuration): Promise<number | void> {
  const executable = basename(opts.arguments[0]);
  const subcommand_name = opts.arguments[1];
  const subcommand = command.subcommands?.[subcommand_name];

  // NOTE if we have a subcommand then call that with the adjusted argv
  if (subcommand) {
    const child_options = rename_executable_and_remove_subcommmand(opts, `${executable} ${subcommand_name}`);
    return run_command_with_options(subcommand, child_options, cfg);
  }

  if (subcommand_name === 'help' || opts.bool('help')) {
    print_help(executable, command);
    return EXIT_CODE.ok;
  }

  if (subcommand_name === 'version' || opts.bool('version')) {
    print_version(root_executable(executable), cfg);
    return EXIT_CODE.ok;
  }

  // NOTE if the user has not specified a command, and we have a default command, then execute that
  if (command.default) {
    const subcommand = command.subcommands?.[command.default];
    if (!subcommand) {
      throw new Error(`Implementation fault: default command ${command.default} does not exist as a subcommand of ${executable}.`);
    }
    
    const max_parameters = subcommand.parameters ?? 0;
    const argument_count = opts.arguments.length - 1;

    if (argument_count > max_parameters && command.subcommands) {
      print_did_you_mean(command, executable, subcommand_name);
      return EXIT_CODE.error;
    }

    const child_options = rename_executable(opts, `${executable} ${command.default}`);
    return run_command_with_options(subcommand, child_options, cfg);
  }

  // NOTE if the command has an action attached to it then we should execute that
  if (command.action) {
    const child_options = remove_executable(opts);
    const max_parameters = command.parameters ?? 0;
    const argument_count = child_options.arguments.length;

    if (argument_count > max_parameters) {
      if (command.subcommands) {
        print_did_you_mean(command, executable, subcommand_name);
      } else {
        terminal
          .print_line(`${font_color.red`error`} - ${bold(executable)} expects up to ${max_parameters} arguments but received ${argument_count}.`, 'stderr')
          .new_line('stderr');
      }
      
      return EXIT_CODE.error;
    }

    try {
      const expanded_options = command.aliases ? resolve_aliases(child_options, command.aliases) : child_options;
      if (cfg.strict_options) {
        validate_options(command, expanded_options);
      }
      return await command.action(expanded_options);
    } catch (err) {
      const message = err instanceof Error ? err.message : util.inspect(err);
      terminal.print_line(`${font_color.red`error`} - ${message}`, 'stderr').new_line('stderr');
      return EXIT_CODE.error;
    }
  }

  if (subcommand_name) {
    print_did_you_mean(command, executable, subcommand_name);
    return EXIT_CODE.error;
  }

  print_help(executable, command);
  return EXIT_CODE.ok;
}