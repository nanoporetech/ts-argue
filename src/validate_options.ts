import type { Argv } from './Argv.type';
import type { Command } from './Command.type';


export function validate_options (command: Command, arg: Argv): void {
  const valid_options = command.options ?? {};
  const unrecognised_options = [];

  for (const opt_name of arg.options.keys()) {
    if (!(opt_name in valid_options)) {
      unrecognised_options.push(opt_name);
    }
  }

  if (unrecognised_options.length > 0) {
    const plural = unrecognised_options.length > 1;
    throw new Error(`Unrecognised option${plural ? 's' : ''} ${unrecognised_options.map(opt => `--${opt}`).join(' ')}`);
  }
}