export class ExpectInvocableError extends Error {
  constructor() {
    super('Callable is not a Closure or invokable object.');
  }
}
