import { DependencyKey } from '../Types';

export class KeyFrozenError extends Error {
  constructor(key: DependencyKey) {
    super(`Key "${String(key)}" is frozen and cannot be modified.`);
  }
}
