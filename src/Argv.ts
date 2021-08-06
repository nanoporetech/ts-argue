import type { Argv } from './Argv.type';

import { isUndefined, makeNumber, makeString } from 'ts-runtime-typecheck';
import mri from 'mri';

export function rename_executable (argv: Argv, exe_name: string): Argv {
	const args = argv.arguments.slice(0);
	args[0] = exe_name;
	return {
		options: new Map(argv.options),
		arguments: args,
	};
}

export function root_executable (exe_name: string): string {
	return exe_name.split('-')[0];
} 

export function nice_executable_name (exe_name: string): string {
  return exe_name.split('-').join(' ');
}

export function rename_executable_and_remove_subcommmand (argv: Argv, exe_name: string): Argv {
	// this is technically removing the executable, and renaming the subcommand to the executable
	// but the end effect is the same
	const args = argv.arguments.slice(1);
	args[0] = exe_name;
	return {
		options: new Map(argv.options),
		arguments: args,
	};
}

export function remove_executable (argv: Argv): Argv {
	return {
		options: new Map(argv.options),
		arguments: argv.arguments.slice(1),
	};
}

export function parse_argv(args: string[]): Argv {
	// TODO replace mri with custom implementation
	const { _, ...options} = mri(args);
	return {
		arguments: Array.from(_), // wrapper required to make array readonly
		options: new Map(Object.entries(options).map(([name, value]) => [name, makeString(value)])),
	};
}

export function read_opt_boolean_option (argv: Argv, opt_name: string): boolean | null {
  const value = argv.options.get(opt_name);

  if (isUndefined(value)) {
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

export function read_opt_string_option (argv: Argv, opt_name: string): string | null {
  const value = argv.options.get(opt_name);

  if (isUndefined(value)) {
    return null;
  }

	return value;
}

export function read_opt_numerical_option (argv: Argv, opt_name: string): number | null {
  const value = argv.options.get(opt_name);

  if (isUndefined(value)) {
    return null;
  }

	try {
		return makeNumber(value);
	} catch {
		throw new Error(`Expected numerical value for option ${opt_name} but found ${value}`);
	}
}

export function read_boolean_option (argv: Argv, opt_name: string, fallback = false): boolean {
	return read_opt_boolean_option(argv, opt_name) ?? fallback;
}

export function read_numerical_option (argv: Argv, opt_name: string, fallback = 0): number {
  return read_opt_numerical_option(argv, opt_name) ?? fallback;
}

export function read_string_option (argv: Argv, opt_name: string, fallback = ''): string {
  return read_opt_string_option(argv, opt_name) ?? fallback;
}