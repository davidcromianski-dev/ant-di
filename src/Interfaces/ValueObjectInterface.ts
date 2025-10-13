import { DependencyKey } from '../Types';

export interface ValueObjectInterface {
  asSingleton(): this;

  asFactory(): this;

  getValue<T>(): T;

  getKey(): DependencyKey;

  getDependencies(): any[];

  addDependency(dependency: DependencyKey): this;

  removeDependency(dependency: DependencyKey): this;

  hasDependency(dependency: DependencyKey): boolean;

  validateDependencies(): boolean;

  resolveDependencies(): any[];

  isResolvable(): boolean;

  getDependencyKeys(): DependencyKey[];

  clearDependencies(): this;

  clone(): ValueObjectInterface;
}
