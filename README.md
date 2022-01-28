# ts-argue

![100% coverage](https://img.shields.io/badge/coverage-100%25-success)
![npm](https://img.shields.io/npm/dm/ts-argue)

Creating a command line tool ( CLT ) that does more than 1 thing can quickly become a mess of flags and conditional logic. ts-argue is a framework for composing modular Node.js CLTs from a series of simple Command definitions. A Command can define an action, or collect multiple subcommands in a group. Allowing you to compose a intuitive hierarchy of actions for your tool. As a bonus they even generate detailed and accurate help text for users. 

## Getting started

To get started you will first need to install ts-argue from npm.

```sh
npm i ts-argue
```

While ts-argue was developed using TypeScript, and we strongly advise using TS within your project, it will of course work fully in a JavaScript application.

An extensive [example application](./examples/contacts/README.md) is included within this project. It demonstrates how to define command actions, compose command groups and shows you how to setup tests using Jest to validate the behavior of your commands.

You can try the example by downloading this repo and following the instructions in the [examples README](./examples/contacts/README.md).

## Basic principles

Applications in ts-argue are defined as a graph of `Command` objects. These are just a normal objects that implement the `Command` interface that ts-argue defines. To execute the command you call `run_command` passing in the command you want to run. Process arguments are automatically processed and interpreted for the command.

```ts
import type { Command } from 'ts-argue';

const my_command: Command = {
  description: "This is my command, it doesn't do anything"
}

run_command(my_command)
```

You compose command groups by defining _subcommands_. These are commands which are only executed when the first argument matches the name of a subcommand. For example `node ./file new` would execute the script `./file` and look for a subcommand called "new" on the root command, it would then execute that subcommand.

```ts
import type { Command } from 'ts-argue';

const new_command: Command = {
  action (opts) {
    // [ create a new file here ]
    terminal.print_line(opts.arguments.join())
  }
}

const root_command: Command = {
  subcommands: {
    new: new_command
  }
}

run_command(root_command)
```

Arguments are processed from left to right and matched to subcommands by name, descending through the tree. If an argument doesn't match with a subcommand then the current command will be run passing in the remaining arguments.

```sh
node ./file new cat.gif
# [ 'cat.gif' ]
```

## Command

Command defines 8 properties, which are all optional. So a blank object is technically still a command, but it won't do very much. These properties allow you to clearly define it's behavior and provide rich help text for your users.

### `description`

Text which is displayed to the user within the help prompt to explain what a command does.

```ts
import type { Command } from 'ts-argue';

const my_command: Command = {
  description: "This is my command, it doesn't do anything"
}
```

### `subcommands`

A dictionary that maps the names of subcommands to Command objects. `help` and `version` are subcommands for every command, but can be overridden if you wish them to behave differently.

```ts
import type { Command } from 'ts-argue';

const foo_command: Command = {
  description: 'Foo'
}
const bar_command: Command = {
  description: 'Bar'
}

const my_command: Command = {
  subcommands: {
    foo: foo_command,
    bar: bar_command
  }
}
```

### `options`

A dictionary that maps the names of options to a description. This text will be displayed as part of the help prompt. `help` and `version` are options for every command, but can be overridden with a different command by defining a subcommand called 'help' or 'version' respectively.

```ts
import type { Command } from 'ts-argue';

const foo_command: Command = {
  options: {
    foo: 'This is my option, and this is what it is'
  }
}
```

### `default`

The name of a subcommand which is executed if the current command is run; instead of executing an action or displaying help text.

```ts
import type { Command } from 'ts-argue';

const foo_command: Command = {
  description: 'Foo'
}
const bar_command: Command = {
  description: 'Bar'
}

const my_command: Command = {
  subcommands: {
    foo: foo_command,
    bar: bar_command
  },
  default: 'foo'
}
```

### `examples`

An array of examples for how to use the command, these will be included in the help prompt and each will be prefixed with the current command.

```ts
import type { Command } from 'ts-argue';

const foo_command: Command = {
  examples: [
    '$FIRST_ARG --foo=123',
    '$FIRST_ARG $SECOND_ARG --bar'
  ]
}
```

### `parameters`

The maximum number of arguments that the command will accept. Defaults to `0`. Use `Infinity` if you want no limit.

```ts
import type { Command } from 'ts-argue';

const foo_command: Command = {
  parameters: 1
}
```

### `aliases`

A dictionary that maps aliases to option names. `h` and `v` are already specified for `help` and `version` respectively. Aliases will be printed on the same line as the option in the help text. They are normally single characters but are not limited to that length.

```ts
import type { Command } from 'ts-argue';

const foo_command: Command = {
  options: {
    foo: 'This is my option, and this is what it is'
  },
  aliases: {
    f: 'foo'
  }
}
```

### `action`

A function that is executed when the command is run. Any thrown error will be caught and printed to stderr automatically. Additionally the process will be exited with an code of 1 to indicate failure. If you return a value that resolves to a number then the process will exit once the command has been run and emit that value as the exit code. If the function does not throw and does not resolve to a number then it will not exit the process, instead relying on the Node.js runtime to decide when your application has finished running.

The function will receive one argument which is an `Argv` object. This will allow you to access the options and arguments for the command.

```ts
import type { Command, Argv } from 'ts-argue';

const foo_command: Command = {
  async action (opts: Argv) {
    // 
  }
}
```

## Argv

Once interpreted as arguments and options the process.argv is wrapped with an Argv instance. This object encloses 2 collections: `arguments` and `options`. Values are left as strings so that they can be interpreted in context by the developer. When passed into an action the `arguments` array will not include the executable name or any subcommands, only values which haven't been "used" by that point.

`options` collects all the instances of a option that were used. They are not converted to a specific type, but several helpers are defined on Argv to assist with interpreting the options you have received.

Any aliases defined by the command will be resolved to the real option name prior to the action being received, and if 'strict_options' is specified when executing a command then any option passed which isn't defined by the command will be rejected with an error prior to executing the command.

```ts
import { parse_argv, Command, Argv } from 'ts-argue';

// you can generate your own Argv object from an array of string using `parse_argv`
// but typically you will be handed one in the action of a command
const opts = parse_argv(['james', '--skill', 'cycling', '--active', '--skill', 'coding', '--age', '42']);

opts.arguments // [ 'james' ]

opts.options // Map(2) { 'skill' => [ 'coding', 'cycling' ], 'age' => [ '42' ], 'active' => [ 'true' ] }

opts.number('age') // 42
opts.arr_string('skill') // [ 'coding', 'cycling' ]
opts.bool('active') // true
opts.bool('cyborg') // null

const cmd: Command = {
  action (opts: Argv) {
    const indices: number[] = opts.arr_number('indices') ?? [];
    const label: string | null = opts.string('label');
  }
}
```

## Reference

### `run_command(cmd: Command, cfg?: Configuration): Promise<never>`

Executes the given command using the process arguments as input. Accepts an optional configuration object as the second parameter.

If the leading argument matches the name of a subcommand it will resolve to the matching subcommand and run that command instead. This process will continue recursively until no more matches are found. It is possible to define circular command graphs, but not advised.

If the command that is run resolves to a number it will exit the process using that as a code as soon as the action has run. Any error thrown will also cause the process to exit with a code of 1.

```ts
import { Command, run_command } from 'ts-argue';

const foo_command: Command = {
  description: 'Example command'
}

run_command(foo_command)
```

### `run_command_with_options(cmd: Command, opts: Argv, cfg?: Configuration)`

Executes the given command with an Argv object. This object can be generated using `parse_argv`. Unlike run_command it will not exit automatically once the command fails. A failing command will cause this to return a promise that resolves to 1. Passing in the configuration option `throw_errors` will prevent this behavior, and it will instead throw. Which is more helpful in a testing scenario, or if you are running commands in a script instead of a shell.

```ts
import { Command, run_command_with_options } from 'ts-argue';

const foo_command: Command = {
  description: 'Example command'
}

run_command_with_options(foo_command, parse_argv(['command name', 'arg1', 'arg2']))
```

### `interface Configuration`

`run_command`, `run_command_with_options` and `print_version` all accept an optional configuration object. Several properties can be defined to change the execution behavior.

```ts
import type { Configuration } from 'ts-argue';

let cfg: Configuration = {

}
interface Configuration {
  version?: string; // specifies a version for `print_version` to use, defaults to '(unknown)'
  strict_options?: boolean; // validate passed options against the command before running, defaults to false
  name?: string; // replaces the name of the executable used in help messages etc., defaults to the basename of the executed file ( only works with `run_command` )
  throw_errors?: boolean; // normally a failing command will be handled automatically, this suppresses that behavior so it can be handled by the developer
}
```

### `parse_argv(args: string[])`

Parses an array of arguments into a Argv object.

```ts
import { parse_argv } from 'ts-argue';

const opts = parse_argv(['command name', 'arg1', 'arg2']);
```

### `print_help(cmd_name: string, cmd: Command)`

Prints the help prompt for the given command.

```ts
import { Command, print_help } from 'ts-argue';

const foo_command: Command = {
  description: 'Example command'
}

print_help('foo', foo_command)
```

### `print_version(exe_name: string, cfg?: Configuration)`

Prints the version prompt for the application.

```ts
import { Command, print_help } from 'ts-argue';

print_version('foo', { version: '1' })
```

## Terminal

The `terminal` object is a utility intended to make it easier to interact with the user. It offers a number of methods for outputting to the terminal as well as prompting the user for input. You don't _need_ to use it, but as a "batteries included" solution it's likely to make your life a lot easier.

### `terminal.print_line(line: string, mode?: 'stdout' | 'stderr'): this`

Accepts a string and prints it to the terminal respecting the current indentation level and emitting a newline character at the end. If the text includes multiple lines it will be split to ensure all lines respect the current indentation level. A second parameter can be used to indicate if this should be printed to stdout or stderr; defaulting to stdout.

```ts
import { terminal } from 'ts-argue';

terminal
  .print_line('Hello world')
  .print_line('Possibly an error', 'stderr');

```

### `terminal.print_lines(lines: string[], mode?: 'stdout' | 'stderr'): this`

Accepts an array of strings and prints them to the terminal respecting the current indentation level and emitting a newline character after each. If an element includes multiple lines of text it will be split to ensure all lines respect the current indentation level. A second parameter can be used to indicate if this should be printed to stdout or stderr; defaulting to stdout.

```ts
import { terminal } from 'ts-argue';

terminal.print_lines([
  'Hello',
  'world'
])

```

### `terminal.new_line(mode?: 'stdout' | 'stderr'): this`

Prints a newline character to the terminal, ignoring any indentation. An optional parameter can be used to indicate if this should be printed to stdout or stderr; defaulting to stdout.

```ts
import { terminal } from 'ts-argue';

terminal.new_line()

```

### `terminal.print_table(rows: string[][], headers?: string[], mode?: 'stdout' | 'stderr'): this`

Accepts an array of rows and an optional array of headers, which are printed as a table using box drawing characters to space out the cells. The table will respect the current indentation level. If a header array is passed then a header row will be added to the top of the table. Columns are automatically sized based on the width of the terminal and the size of the content. When there is more text than can be fitted in the width of the terminal oversized cells will be truncated to fit. An optional 3rd parameter can be used to indicate if this should be printed to stdout or stderr; defaulting to stdout.

```ts
import { terminal } from 'ts-argue';

const headers = ['Name', 'Value'];

const rows = [
  ['A', '1'],
  ['B', '2'],
  ['C', '3'],
  ['D', '4'],
  ['E', '5'],
];

terminal.print_table(rows, headers)

```

### `terminal.increase_indent(): this`

Increases the indentation level by 2 columns.

```ts
import { terminal } from 'ts-argue';

terminal
  .print_line('Title')
  .new_line()
  .increase_indent()
  .print_line('content')
  .decrease_indent();

```

### `terminal.decrease_indent(): this`

Decreases the indentation level by 2 columns.

### `terminal.reusable_block(mode?: 'stdout' | 'stderr'): (...lines: string[]) => void`

Creates a reusable area in the terminal that can be printed to multiple times. An optional parameter can be used to indicate if this should be printed to stdout or stderr; defaulting to stdout.
Returns a function that allows you to replace the current content with new text. Previous text can only be replaced if it's an interactive terminal session, if it isn't then the text will be printed as a new block. For this to work it's also required that nothing else has been printed since the block was created, otherwise it will not be possible to clear the previous text and a new block will be created.

```ts
import { terminal } from 'ts-argue';

const status = terminal.reusable_block();
let counter = 0;
const initial = Date.now();

// measure variation and drift in setInterval and log stats over time
setInterval(() => {
  const elapsed = (Date.now() - initial) / 1000;
  status(
    `Elapsed time: ${Math.floor(elapsed)}s`,
    `Tick count: ${counter}`,
    `Average tick: ${(elapsed / count).toFixed(3)}`
  )
  counter += 1;
}, 1000)
```

### `terminal.progress_bar(label: string, mode?: 'stdout' | 'stderr'): (ratio: number) => void`

Creates a labelled progress bar that can be updated. Takes a string which is used as a label for the progress bar as well as a optional parameter that can be used to indicate if this should be printed to stdout or stderr; defaulting to stdout. Returns a function that takes a number between 0 and 1 which indicates the completed status. This function can be called multiple times to update the status. As this is based on reusable_block it has the same restrictions.

If you are in a non-interactive terminal session it's a good idea to either not provide a progress bar or to throttle how frequently you update it. As it will print a new line for each update.

```ts
import { terminal } from 'ts-argue';

const progress = terminal.progress_bar('Loading');
const initial = Date.now();

// 60 second timer that updates every 250ms
const timer = setInterval(() => {
  const ratio = (Date.now() - initial) / 60000;
  progress(ratio);
  if (ratio >= 1) {
    clearInterval(timer);
  }
}, 250);
```

### `terminal.confirm(message: string, initial?: boolean, mode?: 'stdout' | 'stderr'): Promise<boolean>`

Creates an interactive yes/no prompt in the terminal session. If the terminal session is not interactive this will not work. Takes a message to display to the user and an optional initial value. An optional 3rd parameter can be used to indicate if this should be printed to stdout or stderr; defaulting to stdout. Returns a Promise that resolves to the users choice as a boolean.

```ts
import { Command, terminal, run_command } from 'ts-argue'

const cmd: Command = {
  async action () {
    const success = await terminal.confirm('Do the thing?');
    if (success) {
      terminal.print_line('Did the thing')
    } else {
      terminal.print_line('Did not do the thing')
    }
  }
}

run_command(cmd)
```

### `terminal.input(message: string, initial?: string, mode?: 'stdout' | 'stderr'): Promise<string>`

Creates an interactive text prompt in the terminal session. If the terminal session is not interactive this will not work. Takes a message to display to the user and an optional initial value. An optional 3rd parameter can be used to indicate if this should be printed to stdout or stderr; defaulting to stdout. Returns a Promise that resolves to the users choice as a string.

```ts
import { Command, terminal, run_command } from 'ts-argue'

const cmd: Command = {
  async action () {
    const username = await terminal.input('What\'s your name?');
    terminal.print_line(`Hello ${username}`)
  }
}

run_command(cmd)
```

### `terminal.select(message: string, choices: string[], type?: 'select' | 'autocomplete', mode?: 'stdout' | 'stderr'): Promise<string>`

Creates an interactive multiple choice prompt in the terminal session. If the terminal session is not interactive this will not work. Takes a message to display to the user, an optional initial value and an optional type which defines the behavior of the prompt. This type can be `'select'` or `'autocomplete'` and defaults to `'select'`. `'select'` displays a list of items which can be selected using the arrow keys and enter, whereas autocomplete additionally shows a text prompt which reduces the options based on potential matches.

An optional 4th parameter can be used to indicate if this should be printed to stdout or stderr; defaulting to stdout. Returns a Promise that resolves to the users choice as a boolean.

```ts
import { Command, terminal, run_command } from 'ts-argue'

const cmd: Command = {
  async action () {
    const favourite = await terminal.select('Favourite fruit', [
      'lemon',
      'strawberry',
      'apple',
      'pear',
      'banana',
      'kiwi',
      'grape',
      'pineapple'
    ]);
    terminal.print_line(`You like ${favourite}? Awesome me too!`)
  }
}

run_command(cmd)
```

### `terminal.multiselect(message: string, choices: string[], mode?: 'stdout' | 'stderr'): Promise<string[]>`

Creates an interactive multiple choice prompt in the terminal session. If the terminal session is not interactive this will not work. Takes a message to display to the user and an optional initial value. This behaves in a similar manner to `select` but allows multiple items to be selected.

An optional 3rd parameter can be used to indicate if this should be printed to stdout or stderr; defaulting to stdout. Returns a Promise that resolves to the users choice as a boolean.

```ts
import { Command, terminal, run_command } from 'ts-argue'

const cmd: Command = {
  async action () {
    const shopping_list = await terminal.multiselect('Buy fruit', [
      'lemon',
      'strawberry',
      'apple',
      'pear',
      'banana',
      'kiwi',
      'grape',
      'pineapple'
    ]);
    terminal.print_line(`Order places for ${shopping_list.join()}`)
  }
}

run_command(cmd)
```

### `terminal.interactive: boolean`

True if stdin is interactive. A good indication if the terminal is an interactive session.

```ts
import { Command, terminal, run_command } from 'ts-argue'

const cmd: Command = {
  async action () {
    // if we can check with the user if we should proceed
    if (terminal.interactive) {
      const should_continue = await terminal.confirm('Are you sure you wan to continue?');
      if (!should_continue) {
        return;
      }
    }

    // do the thing
  }
}

run_command(cmd)
```

### `terminal.width: number`

The width of the terminal in columns. Defaults to 80 if the terminal isn't interactive.

```ts
import { Command, terminal, run_command } from 'ts-argue'

const cmd: Command = {
  async action () {
    if (terminal.width >= 200) {
      terminal.print_line('big terminal!')
    }
    else if (terminal.width <= 80) {
      terminal.print_line('small terminal...')
    }
    else {
      terminal.print_line('normal terminal?')
    }
  }
}

run_command(cmd)
```

## Style

`style` encapsulates various methods related to ANSI style tags. These allow you to style your text; adding background colours, underlining etc. Support for these style tags are dependant on the terminal in use but any terminal should support the majority of the included features. These styles work by adding invisible characters at the start and end of the string which indicate the start and end of a particular style modification. If the current environment isn't interactive or doesn't support 4 bit colour then style tags will be omitted automatically. This behavior can be forced by setting the FORCE_COLOR environment variable. A value of 0 will disable style tags, but anything else will force it to be enabled. This is helpful for users who prefer to not have stylized output.

Each style method supports being used as a tag for template literals, this allows you to correctly interpolate other text in the middle of your string which may also have a clashing style. For example bold and dim both use the same "normal intensity" character to finish, so a naive attempt to insert a piece of bold text inside dim text will cause any text after the bold to be neither dim or bold.

In the situation that you are not interpolating the choice between function and tag has no difference, other than code style. A tagged template literals can reduce the amount of visual noise compared to a function call, but it depends if your team are familiar with this ecmascript feature.

```ts
import { terminal, style } from 'ts-argue';

// BAD 'world' will not be dim
terminal.print_line(style.dim(`hello ${style.bold('big')} world`))
// GOOD 'hello' and 'world' will both be dim, 'big' will be bold
terminal.print_line(style.dim`hello ${style.bold`big`} world`);

// Identical output
terminal.print_line(style.dim`hello world`)
terminal.print_line(style.dim('hello world'));
```

### Font intensity

3 font intensity options are supported: dim, normal and bold. How these are rendered varies between terminal application. But usually involves adjusting the font brightness and/or weight. Text cannot have multiple intensities at the same time.

```ts
import { terminal, style } from 'ts-argue'

terminal.print_lines([
  style.dim`dim`,
  'normal',
  style.bold`bold`
]);
```

### Font modifiers

Other than intensity some stylistic changes can also be made to your text. Underline and strikethrough are fairly self explanatory. Blink will cause the text to flash. Reverse will swap the background and foreground ( font ) colors. All these effects can be mixed.

```ts
import { terminal, style } from 'ts-argue'

terminal.print_lines([
  style.underline`underline`,
  style.blink`blink`,
  style.reverse`reverse`,
  style.strikethrough`strikethrough`,
])
```

### Colors

ts-argue support 4-bit ANSI color codes. This gives you 16 colors to choose from; 8 normal and 8 'bright' variants. You can use these as foreground ( font ) and background colors independently. The actual rendered color will vary between terminal applications, but remain _similar_.

In addition a 'default' option is given, which matches whatever the default terminal color is for foreground/background respectively. This is handy because not only do the default colors vary but users often customize their theme.

```ts
import { terminal, style } from 'ts-argue';

const { font_color, background_color } = style;

terminal.print_lines([
  font_color.black`black`,
  font_color.red`red`,
  font_color.green`green`,
  font_color.yellow`yellow`,
  font_color.blue`blue`,
  font_color.magenta`magenta`,
  font_color.cyan`cyan`,
  font_color.white`white`,
  font_color.default`default`,
  font_color.bright_black`bright_black`,
  font_color.bright_red`bright_red`,
  font_color.bright_green`bright_green`,
  font_color.bright_yellow`bright_yellow`,
  font_color.bright_blue`bright_blue`,
  font_color.bright_magenta`bright_magenta`,
  font_color.bright_cyan`bright_cyan`,
  font_color.bright_white`bright_white`,
]);

terminal.print_lines([
  background_color.black`black`,
  background_color.red`red`,
  background_color.green`green`,
  background_color.yellow`yellow`,
  background_color.blue`blue`,
  background_color.magenta`magenta`,
  background_color.cyan`cyan`,
  background_color.white`white`,
  background_color.default`default`,
  background_color.bright_black`bright_black`,
  background_color.bright_red`bright_red`,
  background_color.bright_green`bright_green`,
  background_color.bright_yellow`bright_yellow`,
  background_color.bright_blue`bright_blue`,
  background_color.bright_magenta`bright_magenta`,
  background_color.bright_cyan`bright_cyan`,
  background_color.bright_white`bright_white`,
]);
```

### Custom stylization

Applying multiple styles to a single piece of text can be quite verbose. To help with this you can create a custom styling function using `style.custom`. It accepts any number of style tags and returns a function that applies them to a string.

```ts
import { style, terminal, MODIFIERS, FONT_COLOR } from 'ts-argue'

const flashing_red = style.custom(MODIFIERS.blink, MODIFIERS.high_intensity, FONT_COLORS.red);

terminal.print_line(flashing_red`This text should flash and be red`)
```

## Project Status

This is the final pre v1 release and exists purely for backwards compatibility. It's feature complete but still be completely compatible with all the previous versions. Anything that is due to be removed in v1 has been marked as depreciated to aide in transition. It's encouraged to move to the latest release as soon as possible, as future changes will not be made to v0.x unless _really_ required.
