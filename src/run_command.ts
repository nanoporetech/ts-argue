import type { Command } from './Command.type';
import type { Configuration } from './Configuration.type';

import { run_command_with_options } from './run_command_with_options';
import { parse_argv, rename_executable, resolve_aliases } from './Argv';
import { isNumber } from 'ts-runtime-typecheck';
import { COMMON_ALIASES } from './common_aliases.constants';

export async function run_command (command: Command, cfg: Configuration): Promise<void> {
  let options = parse_argv(process.argv.slice(1));
  options = resolve_aliases(options, COMMON_ALIASES);
  if (cfg.name) {
    options = rename_executable(options, cfg.name);
  }
  const code = await run_command_with_options(command, options, cfg);
  if (isNumber(code)) {
    process.exit(code);
  }
}