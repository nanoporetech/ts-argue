import type { Argv, SimpleArgv } from './Argv.type';

import { Dictionary, isUndefined, makeNumber } from 'ts-runtime-typecheck';

export class ArgvImpl implements Argv {
  options: Map<string, string[]>;
  arguments: string[];

  constructor ({ opts, args }: { opts: Map<string, string[]>; args: string[] }) {
    this.options = opts;
    this.arguments = args;
  }

  bool (opt_name: string): boolean | null {
    const value = this.string(opt_name);

    if (value === null) {
      return null;
    }
  
    switch (value.toLowerCase()) {
      case 'false':
      case 'no':
        return false;
      case 'true':
      case 'yes':
        return true;
      default:
        throw new Error(`Expected boolean value for option ${opt_name} but found ${value}`);
    }
  }
  string (opt_name: string): string | null {
    const value = this.options.get(opt_name);

    if (isUndefined(value)) {
      return null;
    }
  
    if (value.length > 1) {
      throw new Error(`Multiple values given for option ${opt_name}`);
    }
  
    return value[0];
  }
  number (opt_name: string): number | null {
    const value = this.string(opt_name);

    if (value === null) {
      return null;
    }
  
    try {
      return makeNumber(value);
    } catch {
      throw new Error(`Expected numerical value for option ${opt_name} but found ${value}`);
    }
  }

  arr_string (opt_name: string): string[] {
    return this.options.get(opt_name) ?? [];
  }
  arr_number (opt_name: string): number[] {
    const value = this.arr_string(opt_name);

    return value.map(n => {
      try {
        return makeNumber(n);
      } catch {
        throw new Error(`Expected numerical values for option ${opt_name} but found ${n}`);
      }
    });
  }
}

export function rename_executable (argv: SimpleArgv, exe_name: string): Argv {
  const args = argv.arguments.slice(0);
  args[0] = exe_name;

  return new ArgvImpl({
    opts: new Map(argv.options),
    args
  });
}

export function root_executable (exe_name: string): string {
  return exe_name.split(' ')[0];
}

export function rename_executable_and_remove_subcommmand (argv: SimpleArgv, exe_name: string): Argv {
  // this is technically removing the executable, and renaming the subcommand to the executable
  // but the end effect is the same
  const args = argv.arguments.slice(1);
  args[0] = exe_name;
  return new ArgvImpl({
    opts: new Map(argv.options),
    args
  });
}

export function remove_executable (argv: SimpleArgv): Argv {
  return new ArgvImpl({
    opts: new Map(argv.options),
    args: argv.arguments.slice(1)
  });
}

export function resolve_aliases (argv: SimpleArgv, aliases: Dictionary<string>): Argv {
  const resolved_options = new Map<string, string[]>();

  for (const [key, values] of argv.options) {
    const resolved_key = key in aliases ? aliases[key] : key;
    // check if we already have values for that key and merge if we do
    const existing = resolved_options.get(resolved_key);
    resolved_options.set(resolved_key, existing ? existing.concat(values) : values.slice(0));
  }
  
  return new ArgvImpl({
    opts: resolved_options,
    args: argv.arguments.slice(0),
  });
}

/**
 *  Inserts new values into the option map.
 * 
 *  Each key has an array of values so this deals with creating the array for the first
 *  value of that key and appending the value if it's not the first value.
 */
function append_option(opts: Map<string, string[]>, opt: string, value: string) {
  const existing = opts.get(opt) ?? [];
  existing.push(value);
  opts.set(opt, existing);
}

/**
 * Parses an array of argument like strings to extract the parts that look like options.
 * 
 * Complex example including all main syntax derivatives.
 * 
 * `arg1 - --foo --bar value -abc --foo=false -de=123 -- --special`
 * ```
 * {
 *   arguments: ['arg1', '-', '--special']
 *   options: {
 *     foo: 'true', 'false'
 *     bar: 'value'
 *     a: 'true'
 *     b: 'true'
 *     c: 'true'
 *     d: '123'
 *     e: '123'
 *   }
 * }
 * ```
 */
export function parse_argv (argv: string[]): Argv {
  const args = [];
  const opts = new Map<string, string[]>();
  const l = argv.length;
  let i = 0;

  function split_option (option: string): [string, string] {
    if (option.includes('=')) {
      const parts = option.split('=');
      return [ parts[0], parts.slice(1).join('=') ];
    }
    
    if (i + 1 < l) {
      const next = argv[i + 1];
      if (!next.startsWith('-')) {
        i += 1;
        return [option, next];
      }
    }

    return [option, 'true'];
  }

  for (; i < l; i += 1) {
    const arg = argv[i];

    // command arg -- --treat --these --as --args
    if (arg == '--') {
      args.push(...argv.slice(i + 1));
      break;
    }

    // --opt
    if (arg.startsWith('--')) {
      const [opt, value] = split_option(arg.slice(2));

      append_option(opts, opt, value);
    } else if (arg.startsWith('-') && arg.length > 1) {
      const [opt, value] = split_option(arg.slice(1));

      for (const ch of opt) {
        append_option(opts, ch, value);
      }
    } else {
      args.push(arg);
    }
  }

  return new ArgvImpl({ args, opts });
}
