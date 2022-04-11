import type { Dictionary } from 'ts-runtime-typecheck';
import type { Argv } from './Argv.type';

/**
 * Applications in ts-argue are defined as a graph of `Command` objects. These are just a normal objects that implement the `Command` interface.
 * 
 * Command defines many properties, which are all optional. So a blank object is technically still a command, but it won't do very much. These properties allow you to clearly define it's behavior and provide rich help text for your users.
 * 
 * To execute the command you call `run_command` passing in the command you want to run. Process arguments are automatically processed and interpreted for the command.
 * 
 * ```ts
 * import { Command, run_command } from 'ts-argue';
 * 
 * const my_command: Command = {
 *   description: "This is my command, it doesn't do anything"
 * }
 * 
 * run_command(my_command)
 * ```
 * 
 * You compose command groups by defining _subcommands_. These are commands which are only executed when the first argument matches the name of a subcommand. For example `node ./file new` would execute the script `./file` and look for a subcommand called "new" on the root command, it would then execute that subcommand.
 * 
 * ```ts
 * import type { Command } from 'ts-argue';
 * 
 * const new_command: Command = {
 *   action (opts) {
 *     // [ create a new file here ]
 *     terminal.print_line(`Creating new file ${opts.arguments.join()}`)
 *   }
 * }
 * 
 * const root_command: Command = {
 *   subcommands: {
 *     new: new_command
 *   }
 * }
 * 
 * run_command(root_command)
 * ```
 * 
 * Arguments are processed from left to right and matched to subcommands by name, descending through the tree. If an argument doesn't match with a subcommand then the current command will be run passing in the remaining arguments.
 * 
 * ```sh
 * > node ./file new cat.gif
 * Creating new file cat.gif
 * ```
 */
export interface Command {
  /**
   * Text which is displayed to the user within the help prompt to explain what a command does.
   * 
   * ```ts
   * import type { Command } from 'ts-argue';
   * 
   * const my_command: Command = {
   *   description: "This is my command, it doesn't do anything"
   * }
   * ```
   */
  description?: string;
  /**
   * A dictionary that maps the names of subcommands to Command objects. `help` and `version` are subcommands for every command, but can be overridden if you wish them to behave differently.
   * 
   * ```ts
   * import type { Command } from 'ts-argue';
   * 
   * const foo_command: Command = {
   *   description: 'Foo'
   * }
   * const bar_command: Command = {
   *   description: 'Bar'
   * }
   * 
   * const my_command: Command = {
   *   subcommands: {
   *     foo: foo_command,
   *     bar: bar_command
   *   }
   * }
   * ```
   */
  subcommands?: Dictionary<Command>;
  /**
   * A dictionary that maps the names of options to a description. This text will be displayed as part of the help prompt. `help` and `version` are options for every command, but can be overridden with a different command by defining a subcommand called 'help' or 'version' respectively.
   * 
   * ```ts
   * import type { Command } from 'ts-argue';
   * 
   * const foo_command: Command = {
   *   options: {
   *     foo: 'This is my option, and this is what it is'
   *   }
   * }
   * ```
   */
  options?: Dictionary<string>;
  /**
   * The name of a subcommand which is executed if the current command is run; instead of executing an action or displaying help text.
   * 
   * ```ts
   * import type { Command } from 'ts-argue';
   * 
   * const foo_command: Command = {
   *   description: 'Foo'
   * }
   * const bar_command: Command = {
   *   description: 'Bar'
   * }
   * 
   * const my_command: Command = {
   *   subcommands: {
   *     foo: foo_command,
   *     bar: bar_command
   *   },
   *   default: 'foo'
   * }
   * ```
   */
  default?: string;
  /**
   * An array of examples for how to use the command, these will be included in the help prompt and each will be prefixed with the current command.
   * ```ts
   * import type { Command } from 'ts-argue';
   * 
   * const foo_command: Command = {
   *   examples: [
   *     '$FIRST_ARG --foo=123',
   *     '$FIRST_ARG $SECOND_ARG --bar'
   *   ]
   * }
   * ```
   */
  examples?: string[];
  /**
   * The maximum number of arguments that the command will accept. Defaults to `0`. Use `Infinity` if you want no limit.
   * 
   * ```ts
   * import type { Command } from 'ts-argue';
   * 
   * const foo_command: Command = {
   *   parameters: 1
   * }
   * ```
   */
  parameters?: number;
  /**
   * Mark this command as depreciated. This has 3 main effects:
   * 
   * - The help text for this command will be prefixed with a DEPRECIATED label.
   * - In the context of being a subcommand it will not print any examples in help commands.
   * - When listed as a subcommand in help text it's name will have a strikethrough.
   * 
   * It is expected that you will also modify the command description to explain the depreciation for users.
   */
  depreciated?: boolean;
  /**
   * A dictionary that maps aliases to option names. `h` and `v` are already specified for `help` and `version` respectively. Aliases will be printed on the same line as the option in the help text. They are normally single characters but are not limited to that length.
   * 
   * ```ts
   * import type { Command } from 'ts-argue';
   * 
   * const foo_command: Command = {
   *   options: {
   *     foo: 'This is my option, and this is what it is'
   *   },
   *   aliases: {
   *     f: 'foo'
   *   }
   * }
   * ```
   */
  aliases?: Dictionary<string>
  /** 
   * A function that is executed when the command is run. Any thrown error will be caught and printed to stderr automatically. Additionally the process will be exited with an code of 1 to indicate failure. If you return a value that resolves to a number then the process will exit once the command has been run and emit that value as the exit code. If the function does not throw and does not resolve to a number then it will not exit the process, instead relying on the Node.js runtime to decide when your application has finished running.
   * 
   * The function will receive one argument which is an `Argv` object. This will allow you to access the options and arguments for the command.
   * 
   * ```ts
   * import type { Command, Argv } from 'ts-argue';
   * 
   * const foo_command: Command = {
   *   async action (opts: Argv) {
   *     // [...]
   *   }
   * }
   * ```
   */
  action?: (opts: Argv) => Promise<void | number> | number | void;
}