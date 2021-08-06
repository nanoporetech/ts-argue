import * as style from './style';
import { prompt } from 'enquirer';

const INDENT_SIZE = 2;
export class Terminal {
  indent = 0;
  readonly interactive = process.stdin.isTTY;

  get width(): number {
    return process.stdout.columns || 80;
  }

  async confirm(message: string, initial = false): Promise<boolean> {
    return this.prompt(message, 'confirm', initial);
  }

  async input(message: string, initial = ''): Promise<string> {
    return this.prompt(message, 'input', initial);
  }

  private async prompt<T>(message: string, type: string, initial: T): Promise<T> {
    try {
      const { result } = await prompt<{ result: T }>({
        type,
        name: 'result',
        message,
        initial,
      });
      return result;
    } catch {
      process.exit(1);
    }
  }

  print(str: string): this {
    process.stdout.write(str);
    return this;
  }

  start_line(): this {
    return this.print(' '.repeat(this.indent));
  }

  print_line(line: string): this {
    return this.print(' '.repeat(this.indent) + line + '\n');
  }

  print_lines(lines: string[]): this {
    for (const line of lines) {
      this.print_line(line);
    }
    return this;
  }

  // TODO allow column size options ( similar to flex: 1 etc )
  // TODO resolve emoji issues...
  print_table(rows: string[][], header?: string[]): this {
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
      this.print_line(column_widths.map(width => '━'.repeat(width)).join('━┯━'));

      if (header) {
        const cells = [];
        for (let i = 0; i < column_count; i += 1) {
          const target_width = column_widths[i];
          const raw_text = header[i] ?? '';
          const { text, length } = style.truncate_styled_string(raw_text, target_width);
          const padding_count = Math.max(target_width - length, 0);
          cells.push(text + ' '.repeat(padding_count));
        }

        this.print_line(cells.join(' │ '));

        this.print_line(column_widths.map(width => '─'.repeat(width)).join('─┼─'));
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

        this.print_line(cells.join(' │ '));
      }

      this.print_line(column_widths.map(width => '━'.repeat(width)).join('━┷━'));
    }

    return this;
  }

  new_line(): this {
    return this.print('\n');
  }

  increase_indent(): this {
    this.indent += INDENT_SIZE;
    return this;
  }

  decrease_indent(): this {
    this.indent = Math.max(0, this.indent - INDENT_SIZE);
    return this;
  }

  info(...values: unknown[]): void {
    console.log('info  -', ...values);
  }

  debug(...values: unknown[]): void {
    console.log(style.font_color.blue`debug -`, ...values);
  }

  warn(...values: unknown[]): void {
    console.log(style.font_color.yellow`warn  -`, ...values);
  }

  error(...values: unknown[]): void {
    console.log(style.font_color.red`error -`, ...values);
  }
}

export const terminal = new Terminal;