import type { Configuration } from './Configuration.type';
import { log } from './Terminal';
import * as style from './style';

export function print_version(executable: string, cfg: Configuration): void {
	log.print_line(`${style.bold(executable)} version ${cfg.version}`);
	log.new_line();
}