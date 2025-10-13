import { DependencyKey } from '../Types';

export class KeyIsNotDefinedError extends Error {
  constructor(key: DependencyKey) {
    super(`Key "${String(key)}" is not defined.`);
  }
}
