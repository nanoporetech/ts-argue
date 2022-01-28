import { Command, style, terminal } from 'ts-argue';

/**
 * styles color
 * 
 * Print out all the variations of foreground and background colors.
 */
export const color_command: Command = {
  description: 'Print out all the variations of foreground and background colors.',
  action() {
    const { font_color, background_color } = style;
    terminal.print_table([
      [ font_color.black`black`, font_color.bright_black`bright_black` ],
      [ font_color.red`red`, font_color.bright_red`bright_red` ],
      [ font_color.green`green`, font_color.bright_green`bright_green` ],
      [ font_color.yellow`yellow`, font_color.bright_yellow`bright_yellow` ],
      [ font_color.blue`blue`, font_color.bright_blue`bright_blue` ],
      [ font_color.magenta`magenta`, font_color.bright_magenta`bright_magenta` ],
      [ font_color.cyan`cyan`, font_color.bright_cyan`bright_cyan` ],
      [ font_color.white`white`, font_color.bright_white`bright_white` ],
    ], [ 'Normal', 'Bright']);
    
    terminal.print_table([
      [ background_color.black`black  `, background_color.bright_black`bright_black  ` ],
      [ background_color.red`red    `, background_color.bright_red`bright_red    ` ],
      [ background_color.green`green  `, background_color.bright_green`bright_green  ` ],
      [ background_color.yellow`yellow `, background_color.bright_yellow`bright_yellow ` ],
      [ background_color.blue`blue   `, background_color.bright_blue`bright_blue   ` ],
      [ background_color.magenta`magenta`, background_color.bright_magenta`bright_magenta` ],
      [ background_color.cyan`cyan   `, background_color.bright_cyan`bright_cyan   ` ],
      [ background_color.white`white  `, background_color.bright_white`bright_white  ` ],
    ], [ 'Normal', 'Bright']); 
  }
};