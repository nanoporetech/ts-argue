import { Command, style, terminal } from 'ts-argue';

/**
 * styles modification
 * 
 * Print out all the variations of font modification.
 */
export const modification_command: Command = {
  description: 'Print out all the variations of font modification.',
  action() {
    
    terminal.print_lines([
      style.dim`dim`,
      style.bold`bold`,
      style.underline`underline`,
      style.blink`blink`,
      style.reverse`reverse`,
      style.strikethrough`strikethrough`,
    ]);
  }
};