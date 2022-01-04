export interface SimpleArgv {
  options: Map<string, string[]>;
  arguments: string[];
}
export interface Argv extends SimpleArgv {
  bool   (name: string): boolean | null;
  string (name: string): string  | null;
  number (name: string): number  | null;

  arr_string (name: string): string[];
  arr_number (name: string): number[];
}