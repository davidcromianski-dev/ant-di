/* eslint-disable no-unused-vars */
import { ContainerInterface, ValueObjectInterface } from '../Interfaces';
import { DependencyKey } from '../Types';

export class ValueObject implements ValueObjectInterface {
  private instance: any;
  public singleton: boolean = false;
  public factory: boolean = false;
  private dependencies: DependencyKey[] = [];
  public resolutionPath: DependencyKey[] = [];

  constructor(
    private readonly _container: ContainerInterface,
    private readonly _key: DependencyKey,
    private readonly _value: any,
  ) {}

  asSingleton(): this {
    this.singleton = true;
    return this;
  }

  asFactory(): this {
    this.factory = true;
    return this;
  }

  getValue<T>(): T {
    if (this.singleton) {
      this.instance ??= this.createInstance();
      return this.instance as T;
    }
    if (this.factory) {
      return this._value(this._container) as T;
    }
    return this.createInstance() as T;
  }

  getDependencies(): any[] {
    return this.resolveDependencies();
  }

  getKey(): DependencyKey {
    return this._key;
  }

  // New isolated logic methods for better dependency management
  addDependency(dependency: DependencyKey): this {
    if (!this.hasDependency(dependency)) {
      this.dependencies.push(dependency);
    }
    return this;
  }

  removeDependency(dependency: DependencyKey): this {
    this.dependencies = this.dependencies.filter(dep => dep !== dependency);
    return this;
  }

  hasDependency(dependency: DependencyKey): boolean {
    return this.dependencies.includes(dependency);
  }

  validateDependencies(): boolean {
    try {
      return this.dependencies.every(dep => this._container.has(dep));
    } catch {
      return false;
    }
  }

  resolveDependencies(): any[] {
    // Check for circular dependencies
    if (this.resolutionPath.includes(this._key)) {
      throw new Error(`Circular dependency detected for ${String(this._key)}`);
    }

    this.resolutionPath.push(this._key);

    try {
      const resolved = this.dependencies.map(dep => {
        // Handle constructor functions by converting to string key
        const depKey = typeof dep === 'function' ? dep.name : dep;

        if (this._container.has(depKey)) {
          const value = this._container.getRawValue(depKey);
          // If it's a constructor function, instantiate it
          if (
            typeof value === 'function' &&
            value.prototype &&
            value.prototype.constructor === value
          ) {
            return new value();
          }
          return this._container.get(depKey);
        }
        throw new Error(`Dependency ${String(dep)} not found in container`);
      });

      return resolved;
    } finally {
      this.resolutionPath = this.resolutionPath.filter(key => key !== this._key);
    }
  }

  isResolvable(): boolean {
    return this.validateDependencies() && !this.hasCircularDependency();
  }

  getDependencyKeys(): DependencyKey[] {
    return [...this.dependencies];
  }

  clearDependencies(): this {
    this.dependencies = [];
    this.resolutionPath = [];
    return this;
  }

  clone(): ValueObjectInterface {
    const cloned = new ValueObject(this._container, this._key, this._value);
    cloned.singleton = this.singleton;
    cloned.factory = this.factory;
    cloned.dependencies = [...this.dependencies];
    return cloned;
  }

  // Private helper methods
  private createInstance(): any {
    if (typeof this._value === 'function') {
      const resolvedDeps = this.resolveDependencies();
      return new this._value(...resolvedDeps);
    }
    return this._value;
  }

  private hasCircularDependency(): boolean {
    // Only check for circular dependency if we're currently in resolution path
    return this.resolutionPath.length > 0 && this.resolutionPath.includes(this._key);
  }
}
