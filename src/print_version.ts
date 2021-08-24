import type { Configuration } from './Configuration.type';
import { terminal } from './Terminal';
import * as style from './style';

export function print_version(executable: string, cfg: Configuration): void {
  terminal.print_line(`${style.bold(executable)} version ${cfg.version}`);
  terminal.new_line();
}