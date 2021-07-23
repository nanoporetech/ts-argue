import type { Command } from './Command.type';
import type { Configuration } from './Configuration.type';

import { run_command_with_options } from './run_command_with_options';
import { parse_argv } from './Argv';

export async function run_command (command: Command, cfg: Configuration): Promise<void> {
	const options = parse_argv(process.argv.slice(1));
	process.exit(await run_command_with_options(command, options, cfg));
}