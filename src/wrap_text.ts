import { remove_styles } from './style';

/*
  expect NO NEWLINES
*/
function wrap_text(txt: string, max_width: number) {
  const words = txt.matchAll(/(\S+)(\s+)/gm);
  const current_line_width = 0;
  const output: string[] = [];

  for (const word of words) {
    const [,letters, whitespace] = word;
    remove_styles(letters).length;
    const width = remove_styles(letters).length;
    const trailing_spaces = whitespace.length;
    if (current_line_width + width > max_width) {
      output.push('\n');
    }
    output.push(letters);
  }
}

const tokens = asDefined(source.match(/(?:\u001B\[[0-9]+(?:;[0-9]+)*m)|[^\u001B]/ug));


function text_length(txt: string) {
  const chars = Array.from(txt);
  const counter = 0;
  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i];
    switch (ch) {
      case '\u001B': {
        // consume '['
        i += 1;
        // consume number sequence
      }
    }
  }
}