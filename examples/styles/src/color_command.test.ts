import { run_command_with_options, parse_argv } from 'ts-argue';
import { color_command } from './color_command';

it('styles color', async () => {
  await run_command_with_options(color_command, parse_argv(['styles color']), { throw_errors: true });
});