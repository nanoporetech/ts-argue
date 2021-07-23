import * as style from './style';

const INDENT_SIZE = 2;
export class Logger {
  indent = 0;

  print(str: string): void {
    process.stdout.write(str);
  }

  start_line(): void {
    this.print(' '.repeat(this.indent));
  }

  print_line(line: string): void {
    this.print(' '.repeat(this.indent) + line + '\n');
  }

  print_lines(lines: string[]): void {
    for (const line of lines) {
      this.print_line(line);
    }
  }

  new_line(): void {
    this.print('\n');
  }

  increase_indent(): void {
    this.indent += INDENT_SIZE;
  }

  decrease_indent(): void {
    this.indent = Math.max(0, this.indent - INDENT_SIZE);
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

export const log = new Logger;