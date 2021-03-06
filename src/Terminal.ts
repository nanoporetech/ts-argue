import * as style from './style';
import { prompt } from 'enquirer';
import { EXIT_CODE } from './exit_code.constants';
import { isUnion, isLiteral, invariant } from 'ts-runtime-typecheck';

const INDENT_SIZE = 2;
const BLOCK_CHARS = [
  '',
  '▏',
  '▎',
  '▍',
  '▌',
  '▋',
  '▊',
  '▉',
  '█',
];

type Mode = 'stdout' | 'stderr';

const IS_MODE = isUnion(isLiteral('stdout'), isLiteral('stderr'));
const assert_mode = (mode: Mode) => invariant(IS_MODE(mode), `Expected mode to be stdout or stderr, received ${mode}`);

export class Terminal {
  private dirty_line: symbol | null = null;
  readonly interactive = process.stdin.isTTY;

  indent = 0;

  get width(): number {
    return process.stdout.columns || 80;
  }

  async confirm(message: string, initial = false, mode: Mode = 'stdout'): Promise<boolean> {
    assert_mode(mode);
    return this.prompt(message, 'confirm', initial, mode);
  }

  async input(message: string, initial = '', mode: Mode = 'stdout'): Promise<string> {
    assert_mode(mode);
    return this.prompt(message, 'input', initial, mode);
  }

  async select<T extends string = string>(message: string, choices: T[], type: 'select' | 'autocomplete' = 'select', mode: Mode = 'stdout'): Promise<T> {
    invariant(choices.length > 0, 'Implementation error: cannot display an empty selection list.');
    invariant(process[mode].isTTY, 'Unable to display prompt, terminal is not interactive.');
    assert_mode(mode);

    try {
      const { result } = await prompt<{ result: T }>({
        type,
        name: 'result',
        message,
        choices, 
        stdout: process[mode],
      });
      return result;
    } catch {
      process.exit(EXIT_CODE.error);
    }
  }

  async multiselect<T extends string = string>(message: string, choices: T[], mode: Mode = 'stdout'): Promise<T[]> {
    invariant(choices.length > 0, 'Implementation error: cannot display an empty selection list.');
    invariant(process[mode].isTTY, 'Unable to display prompt, terminal is not interactive.');
    assert_mode(mode);

    try {
      const { result } = await prompt<{ result: T[] }>({
        type: 'multiselect',
        name: 'result',
        message,
        choices, 
        stdout: process[mode],
      });
      return result;
    } catch {
      process.exit(EXIT_CODE.error);
    }
  }

  private async prompt<T>(message: string, type: string, initial: T, mode: Mode): Promise<T> {
    assert_mode(mode);
    invariant(process[mode].isTTY, 'Unable to display prompt, terminal is not interactive.');

    try {
      const { result } = await prompt<{ result: T }>({
        type,
        name: 'result',
        message,
        initial,
        stdout: process[mode],
      });
      return result;
    } catch {
      process.exit(EXIT_CODE.error);
    }
  }

  print_line(line: string, mode: Mode = 'stdout'): this {
    assert_mode(mode);

    if (this.dirty_line) {
      this.dirty_line = null;
    }
    process[mode].write(
      line.split('\n')
        .map(sub_line => ' '.repeat(this.indent) + sub_line + '\n')
        .join('')
    );
    
    return this;
  }

  print_lines(lines: string[], mode: Mode = 'stdout'): this {
    assert_mode(mode);
    return this.print_line(lines.join('\n'), mode);
  }

  reusable_block(mode: Mode = 'stdout'): (...lines: string[]) => void {
    assert_mode(mode);

    const marker = Symbol();
    let line_counter = 0;
    return (...lines: string[]) => {
      if (this.dirty_line === marker && process[mode].isTTY) {
        for (let i = 0; i < line_counter; i += 1) {
          process[mode].moveCursor(0, -1);
          process[mode].clearLine(0);
        }
        process[mode].cursorTo(0);
      }

      for (const line of lines) {
        process[mode].write(' '.repeat(this.indent) + line + '\n');
      }
      line_counter = lines.length;
      this.dirty_line = marker;
    };
  }

  progress_bar(label: string, mode: Mode = 'stdout'): (ratio: number) => void {
    assert_mode(mode);

    const fn = this.reusable_block(mode);
    return (ratio: number) => {
      // 3 extra for the space and surrounding brackets
      const available_width = this.width - (label.length + this.indent + 3);
      // width of the solid part of the bar, including fractional component
      const filled = Math.max(0, Math.min(1, ratio)) * available_width;

      // integer component of the solid part
      const filled_width = Math.floor(filled);
      // fractional component of the solid part
      const fractional = filled - filled_width;
      // we have 8 block chars (1/8, 2/8...8/8). This is an index of the first 7. 
      // 0 is an empty string in our lookup, and we skip 8 as it's a solid block
      // and this is for a partial block
      const partial_width = Math.floor(fractional * 8);
      // spaces after the block chars
      const padding_width = available_width - Math.ceil(filled);

      fn(`${label} [${ BLOCK_CHARS[8].repeat(filled_width) }${ BLOCK_CHARS[partial_width] }${ ' '.repeat(padding_width) }]`);
    };
  }

  // TODO allow column size options ( similar to flex: 1 etc )
  // TODO fix row height issues ( newlines in cells, overflow? )
  // TODO resolve emoji issues...
  print_table(rows: string[][], header?: string[], mode: Mode = 'stdout'): this {
    assert_mode(mode);

    // column_widths stores the maximum width of the cells in that column (normalized)
    const column_widths: number[] = [];

    // STEP 1: calculate the space the contents of cells require to decide the width of
    // the columns
    {
      if (header) {
        for (const text of header) {
          const width = style.remove_styles(text).length;
          column_widths.push(width);
        }
      }

      for (const row of rows) {
        for (let column = 0; column < row.length; column += 1) {
          const text = row[column];
          // NOTE normalize the text by removing any unprintable style characters
          // WARN this doesn't deal with emoji, but they don't have an accurate width anyway so... avoid using emoji?
          const width = style.remove_styles(text).length;
          column_widths[column] = Math.max(width, column_widths[column] ?? 0);
        }
      }
    }
    
    const column_count = column_widths.length;

    // STEP 2: calculate the available width and the required width. if the required width
    // exceeds the available space then reduce the column widths proportionally
    {
      const available = this.width - this.indent - 3 * (column_count - 1);
      const required = column_widths.reduce((acc, width) => acc + width, 0);

      if (required > available) {
        // median_width is calculated under the assumption all columns have the same max width
        const median_width = Math.floor(available / column_count);
        let undersized_usage = 0;
        let undersize_count = 0;
        // for any columns that are less than the median we count up how much space they use
        // so that we can calculate an adjusted median_size based on the extra space they aren't using
        for (const width of column_widths) {
          if (width < median_width) {
            undersized_usage += width;
            undersize_count += 1;
          }
        }
        // remove the undersized columns from the equation to get our target_width ( should always be larger than the median_width )
        const target_width = Math.floor((available - undersized_usage) / (column_count - undersize_count));

        // cap the column widths by our new target value
        for (let i = 0; i < column_count; i += 1) {
          const width = column_widths[i];
          column_widths[i] = Math.min(width, target_width);
        }
      }
    }

    // STEP 3: print the table!
    {
      this.print_line(column_widths.map(width => '━'.repeat(width)).join('━┯━'), mode);

      if (header) {
        const cells = [];
        for (let i = 0; i < column_count; i += 1) {
          const target_width = column_widths[i];
          const raw_text = header[i] ?? '';
          const { text, length } = style.truncate_styled_string(raw_text, target_width);
          const padding_count = Math.max(target_width - length, 0);
          cells.push(text + ' '.repeat(padding_count));
        }

        this.print_line(cells.join(' │ '), mode);

        this.print_line(column_widths.map(width => '─'.repeat(width)).join('─┼─'), mode);
      }
      
      for (const row of rows) {
        const cells = [];
        for (let i = 0; i < column_count; i += 1) {
          const target_width = column_widths[i];
          const raw_text = row[i] ?? '';
          const { text, length } = style.truncate_styled_string(raw_text, target_width);
          const padding_count = Math.max(target_width - length, 0);
          cells.push(text + ' '.repeat(padding_count));
        }

        this.print_line(cells.join(' │ '), mode);
      }

      this.print_line(column_widths.map(width => '━'.repeat(width)).join('━┷━'), mode);
    }

    return this;
  }

  new_line(mode: 'stderr' | 'stdout' = 'stdout'): this {
    assert_mode(mode);
    
    process[mode].write('\n');
    this.dirty_line = null;
    return this;
  }

  increase_indent(): this {
    this.indent += INDENT_SIZE;
    return this;
  }

  decrease_indent(): this {
    this.indent = Math.max(0, this.indent - INDENT_SIZE);
    return this;
  }
}

export const terminal = new Terminal;