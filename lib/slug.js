import { customAlphabet } from "nanoid";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const gen = customAlphabet(alphabet, 7);

export function generateSlug() {
  return gen();
}
