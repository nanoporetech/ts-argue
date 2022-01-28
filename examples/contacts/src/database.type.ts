import type { Optional } from 'ts-runtime-typecheck';

export interface Contact {
  name: string;
  email?: Optional<string>;
  mobile?: Optional<string>;
}