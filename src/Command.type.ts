import type { Dictionary } from 'ts-runtime-typecheck';
import type { Argv } from './Argv.type';

export interface Command {
  description?: string;
  subcommands?: Dictionary<Command>;
  options?: Dictionary<string>;
  default?: string;
  examples?: string[];
  parameters?: number;
  aliases?: Dictionary<string>
  action?: (opts: Argv) => Promise<void | number> | number | void;
}