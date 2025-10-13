import { ServiceProviderInterface } from './ServiceProviderInterface';
import { Callable, DependencyKey, Factory } from '../Types';
import { ValueObjectInterface } from './ValueObjectInterface';

export interface ContainerInterface {
  set<T>(key: DependencyKey, value: T, factory?: boolean, dependencies?: DependencyKey[]): void;
  get<T>(key: DependencyKey): T;
  has(key: DependencyKey): boolean;
  unset(key: DependencyKey): void;
  bind(target: DependencyKey, dependencies: DependencyKey[]): void;
  factory(factory: Factory<any>): Factory<any>;
  protect(callable: Callable): Callable;
  raw<T>(key: DependencyKey): T;
  keys(): DependencyKey[];
  clear(): void;
  dispose(): void;
  register(provider: ServiceProviderInterface): this;
  getValueObject(key: DependencyKey): ValueObjectInterface | undefined;
  getRawValue(key: DependencyKey): any;
}
