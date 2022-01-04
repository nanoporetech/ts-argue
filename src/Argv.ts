import type { Argv, SimpleArgv } from './Argv.type';

import { Dictionary, isUndefined, makeNumber, makeString } from 'ts-runtime-typecheck';
import mri from 'mri';

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
 
export function parse_argv(args: string[]): Argv {
  // TODO replace mri with custom implementation
  const { _, ...options} = mri(args);
  return new ArgvImpl({
    args: Array.from(_), // wrapper required to make array readonly,
    opts: new Map(Object.entries(options).map(([name, value]) => {
      // NOTE mri yields either a single Primitive value, or an array of Primitive values
      // to simplify things we convert that into an array of strings
      // it's then up to the consumer to interpret that
      const values = Array.isArray(value) ? value.map(makeString) : [ makeString(value) ];
      return [name, values];
    })),
  });
}

/**
 * @deprecated use `argv.opt_bool(opt_name)` instead, this will be removed in 1.0.0
 */
export function read_opt_boolean_option (argv: SimpleArgv, opt_name: string): boolean | null {
  const value = read_opt_string_option(argv, opt_name);

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

/**
 * @deprecated use `argv.opt_string(opt_name)` instead, this will be removed in 1.0.0
 */
export function read_opt_string_option (argv: SimpleArgv, opt_name: string): string | null {
  const value = argv.options.get(opt_name);

  if (isUndefined(value)) {
    return null;
  }

  if (value.length > 1) {
    throw new Error(`Multiple values given for option ${opt_name}`);
  }

  return value[0];
}

/**
 * @deprecated use `argv.opt_number(opt_name)` instead, this will be removed in 1.0.0
 */
export function read_opt_numerical_option (argv: SimpleArgv, opt_name: string): number | null {
  const value = read_opt_string_option(argv, opt_name);

  if (value === null) {
    return null;
  }

  try {
    return makeNumber(value);
  } catch {
    throw new Error(`Expected numerical value for option ${opt_name} but found ${value}`);
  }
}

/**
 * @deprecated use `argv.arr_string(opt_name)` instead, this will be removed in 1.0.0
 */
export function read_string_array_option (argv: SimpleArgv, opt_name: string): string[] {
  return argv.options.get(opt_name) ?? [];
}

/**
 * @deprecated use `argv.arr_number(opt_name)` instead, this will be removed in 1.0.0
 */
export function read_numerical_array_option (argv: SimpleArgv, opt_name: string): number[] {
  const value = read_string_array_option(argv, opt_name);

  return value.map(n => {
    try {
      return makeNumber(n);
    } catch {
      throw new Error(`Expected numerical values for option ${opt_name} but found ${n}`);
    }
  });
}

/**
 * @deprecated use `argv.bool(opt_name) ?? fallback` instead, this will be removed in 1.0.0
 */
export function read_boolean_option (argv: SimpleArgv, opt_name: string, fallback = false): boolean {
  return read_opt_boolean_option(argv, opt_name) ?? fallback;
}

/**
 * @deprecated use `argv.number(opt_name) ?? fallback` instead, this will be removed in 1.0.0
 */
export function read_numerical_option (argv: SimpleArgv, opt_name: string, fallback = 0): number {
  return read_opt_numerical_option(argv, opt_name) ?? fallback;
}

/**
 * @deprecated use `argv.string(opt_name) ?? fallback` instead, this will be removed in 1.0.0
 */
export function read_string_option (argv: SimpleArgv, opt_name: string, fallback = ''): string {
  return read_opt_string_option(argv, opt_name) ?? fallback;
}