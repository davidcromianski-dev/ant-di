export class KeyCannotBeEmptyError extends Error {
  constructor() {
    super(`Key cannot be empty.`);
  }
}
