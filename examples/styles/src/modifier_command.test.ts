import { run_command_with_options, parse_argv } from 'ts-argue';
import { modification_command } from './modifier_command';

it('styles color', async () => {
  await run_command_with_options(modification_command, parse_argv(['styles modifiers']), { throw_errors: true });
});