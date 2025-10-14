import {
  CircularDependencyError,
  ExpectInvocableError,
  FailedToResolveDependencyError,
  KeyFrozenError,
  KeyIsNotDefinedError,
  NoDependenciesRegisteredError,
} from '../Errors';
import { KeyCannotBeEmptyError } from '../Errors/KeyCannotBeEmptyError';
import { ContainerInterface, ServiceProviderInterface } from '../Interfaces';
import { Callable, Constructor, DependencyKey, Factory, ValueOrFactoryOrCallable } from '../Types';
import { ValueObject } from './ValueObject';

/**
 * Dependency injection container that supports auto-wiring, factories, and service providers.
 * Implements a Pimple-like interface with additional features for TypeScript.
 */
export class Container implements ContainerInterface {
  /** Map of string keys to their corresponding values/services */
  private readonly values = new Map<DependencyKey, any>();

  /** Cache for singleton class instances keyed by constructor */
  private readonly classInstanceCache = new Map<Function, any>();

  /** Map of factory functions to their registration status */
  private readonly factories: Map<Factory<any>, boolean>;

  /** Map of protected callables to their protection status */
  private readonly protected: Map<Callable, boolean>;

  /** Map of frozen keys that cannot be modified after first resolution */
  private readonly frozen = new Map<DependencyKey, ValueOrFactoryOrCallable<any>>();

  /** Map of original factory functions before resolution */
  private readonly _raw = new Map<DependencyKey, ValueOrFactoryOrCallable<any>>();

  /** Array of all registered keys */
  private _keys: DependencyKey[] = [];

  /** Manual dependency registration map for constructors and class names */
  private readonly dependencyMap = new Map<Constructor<any>, Constructor<any>[]>();

  /** Map of ValueObjects for better dependency management */
  private readonly valueObjects = new Map<DependencyKey, ValueObject>();

  /**
   * Creates a new container instance with optional initial values.
   * @param values - Initial key-value pairs to register in the container
   */
  constructor(values: Record<string | symbol, ValueOrFactoryOrCallable<any>> = {}) {
    this.factories = new Map<Factory<any>, boolean>();
    this.protected = new Map<Callable, boolean>();

    Object.entries(values).forEach(([key, value]) => {
      this.set(key, value);
    });

    return new Proxy(this, {
      get: (target, property) => {
        if (typeof property === 'string') {
          if (target.has(property)) {
            return target.get(property);
          }
        }
        return target[property as keyof typeof target];
      },
      set: (target, property, value) => {
        if (typeof property === 'string') {
          target.set(property, value);
          return true;
        }
        return false;
      },
    });
  }

  /**
   * Creates a ValueObject for better dependency management.
   * @param key - The key for the value object
   * @param value - The value, factory, or constructor
   * @param dependencies - Optional dependencies to register
   * @returns A new ValueObject instance
   */
  private createValueObject(
    key: DependencyKey,
    value: ValueOrFactoryOrCallable<any>,
    dependencies: DependencyKey[] = [],
  ): ValueObject {
    const valueObject = new ValueObject(this, key, value);

    // Add dependencies if provided
    dependencies.forEach(dep => valueObject.addDependency(dep));

    return valueObject;
  }

  /**
   * Automatically wires dependencies for a constructor function using ValueObjects.
   * @param constructor - The constructor function to auto-wire
   * @returns A new instance of the class with dependencies injected
   * @throws {Error} If circular dependencies are detected or dependencies cannot be resolved
   */
  private _autoWire<T>(constructor: Constructor<any>): T {
    const constructorName = constructor.name;

    if (!this.dependencyMap.has(constructor)) {
      throw new NoDependenciesRegisteredError(constructorName);
    }

    const paramTypes = this.dependencyMap.get(constructor) ?? [];

    if (!paramTypes || paramTypes.length === 0) {
      return new constructor();
    }

    // Create a ValueObject to handle dependency resolution
    const valueObject = this.createValueObject(constructorName, constructor, paramTypes);

    if (!valueObject.isResolvable()) {
      throw new FailedToResolveDependencyError(
        `Cannot resolve dependencies for ${constructorName}`,
        constructorName,
      );
    }

    const resolvedParams = valueObject.resolveDependencies();
    return new constructor(...resolvedParams);
  }

  private _resolveKey(key: DependencyKey): Constructor<any> {
    if (typeof key === 'symbol' || typeof key === 'string') {
      const value = this.values.get(key);
      if (typeof value === 'function') {
        return value;
      }
      throw new ExpectInvocableError();
    }
    if (typeof key === 'function') {
      return key;
    }
    throw new ExpectInvocableError();
  }

  /**
   * Binds dependencies for a constructor function or class name using ValueObjects.
   * @param target - The constructor function to bind dependencies for
   * @param dependencies - Array of dependency types/constructors
   */
  bind(target: DependencyKey, dependencies: DependencyKey[]): void {
    const resolvedTarget = this._resolveKey(target);

    const resolvedDependencies = dependencies.map(dep => this._resolveKey(dep));

    if (
      resolvedDependencies.length > 0 &&
      resolvedDependencies.some(dep => typeof dep !== 'function')
    ) {
      throw new ExpectInvocableError();
    }

    const key = typeof target === 'function' ? target.name : target;
    if (this.frozen.has(key)) {
      throw new KeyFrozenError(key);
    }

    // Check for circular dependencies manually
    const dependencyNames = resolvedDependencies.map(dep => dep.name);
    if (dependencyNames.includes(resolvedTarget.name)) {
      throw new CircularDependencyError(resolvedTarget.name, resolvedTarget.name);
    }
    for (const dependency of resolvedDependencies) {
      const dependencyDeps = this.dependencyMap.get(dependency);
      if (dependencyDeps?.includes(resolvedTarget)) {
        throw new CircularDependencyError(resolvedTarget.name, dependency.name);
      }
    }

    // Register constructor functions as services if they're not already registered
    resolvedDependencies.forEach(dep => {
      const depKey = dep.name;
      if (!this.values.has(depKey)) {
        this.values.set(depKey, dep);
        if (!this._keys.includes(depKey)) {
          this._keys.push(depKey);
        }
      }
    });

    // Create ValueObject for future use with original dependency keys
    const valueObject = this.createValueObject(key, resolvedTarget, dependencies);

    this.dependencyMap.set(resolvedTarget, resolvedDependencies);

    // Store the ValueObject for future use
    this.valueObjects.set(key, valueObject);

    this.values.set(key, () => this._autoWire(resolvedTarget));

    if (!this._keys.includes(key)) {
      this._keys.push(key);
    }
  }

  /**
   * Sets a value or service in the container.
   * @param key - The key to associate with the value
   * @param value - The value, factory function, or callable to store
   * @throws {Error} If the key is frozen and cannot be modified
   * @deprecated Since 3.0.0. Use set() instead.
   */
  offsetSet<T>(
    key: DependencyKey,
    value: ValueOrFactoryOrCallable<T>,
    factory: boolean = false,
  ): void {
    this.set(key, value, factory);
  }

  /**
   * Sets a value or service in the container (alias for offsetSet for consistency).
   * @param key - The key to associate with the value
   * @param value - The value, factory function, or callable to store
   * @param factory - Whether to treat the value as a factory
   * @param dependencies - Optional dependencies for the value
   * @throws {Error} If the key is frozen and cannot be modified
   */
  set<T>(
    key: DependencyKey,
    value: ValueOrFactoryOrCallable<T>,
    factory: boolean = false,
    dependencies: DependencyKey[] = [],
  ): void {
    if (typeof key === 'function' && 'name' in key) {
      key = (key as { name: string }).name;
    }

    if (this.frozen.has(key)) {
      throw new KeyFrozenError(key);
    }

    if (key === '') {
      throw new KeyCannotBeEmptyError();
    }

    // Create ValueObject if dependencies are provided
    if (dependencies.length > 0) {
      const valueObject = this.createValueObject(key, value, dependencies);
      this.valueObjects.set(key, valueObject);
    }

    this.values.set(key, factory ? this.factory(value as Factory<T>) : value);
    if (!this._keys.includes(key)) {
      this._keys.push(key);
    }
  }

  /**
   * Gets a ValueObject for a given key if it exists.
   * @param key - The key to get the ValueObject for
   * @returns The ValueObject or undefined if not found
   */
  getValueObject(key: DependencyKey): ValueObject | undefined {
    return this.valueObjects.get(key);
  }

  /**
   * Gets the raw value from the values map without any processing.
   * @param key - The key to get the raw value for
   * @returns The raw value or undefined if not found
   */
  getRawValue(key: DependencyKey): any {
    return this.values.get(key);
  }

  /**
   * Retrieves a value or service from the container.
   * @param key - The key or constructor function to retrieve
   * @param resolutionPath - Current resolution path for circular dependency detection
   * @returns The resolved value or service instance
   * @throws {Error} If the key is not defined or dependencies cannot be resolved
   * @deprecated Since 3.0.0. Use get() instead.
   */
  offsetGet<T>(key: DependencyKey): T {
    return this.get(key);
  }

  /**
   * Retrieves a value or service from the container.
   * @param key - The key or constructor function to retrieve
   * @returns The resolved value or service instance
   * @throws {Error} If the key is not defined or dependencies cannot be resolved
   */
  get<T>(key: DependencyKey): T {
    const cacheKey = typeof key === 'function' ? key.name : key;
    if (this.values.has(cacheKey)) {
      const cachedValue = this.values.get(cacheKey);
      const isProtected = this.protected.has(cachedValue);
      if (this.factories.has(cachedValue)) {
        if (isProtected) {
          return cachedValue as unknown as T;
        }
        return cachedValue(this) as T;
      }
      if (typeof cachedValue === 'function') {
        if (isProtected) {
          return cachedValue as unknown as T;
        }

        // Use ValueObject if available for dependency resolution
        const valueObject = this.valueObjects.get(cacheKey);
        if (valueObject) {
          const result = valueObject.getValue();
          this.values.set(cacheKey, result);
          if (!this._raw.has(cacheKey)) {
            this._raw.set(cacheKey, cachedValue);
          }
          this.frozen.set(cacheKey, result);
          return result as T;
        }

        // Fallback to direct function call or constructor instantiation
        const isConstructor =
          cachedValue.prototype && cachedValue.prototype.constructor === cachedValue;
        const result = isConstructor ? new cachedValue() : cachedValue(this);
        this.values.set(cacheKey, result);
        if (!this._raw.has(cacheKey)) {
          this._raw.set(cacheKey, cachedValue);
        }
        this.frozen.set(cacheKey, true);
        return result as T;
      }
      return cachedValue as T;
    }

    throw new KeyIsNotDefinedError(cacheKey);
  }

  /**
   * Checks if a key exists in the container.
   * @param key - The key to check
   * @returns True if the key exists, false otherwise
   * @deprecated Since 3.0.0. Use has() instead.
   */
  offsetExists(key: DependencyKey): boolean {
    return this.has(key);
  }

  /**
   * Checks if a key exists in the container.
   * @param key - The key to check
   * @returns True if the key exists, false otherwise
   */
  has(key: DependencyKey): boolean {
    return (
      this._keys.includes(key) || this.values.has(key) || this.classInstanceCache.has(key as any)
    );
  }

  /**
   * Removes a key and its associated value from the container.
   * @param key - The key to remove
   * @deprecated Since 3.0.0. Use unset() instead.
   */
  offsetUnset(key: DependencyKey): void {
    this.unset(key);
  }

  /**
   * Removes a key and its associated value from the container.
   * @param key - The key to remove
   */
  unset(key: DependencyKey): void {
    if (this._keys.includes(key)) {
      const value = this.values.get(key);
      if (typeof value === 'object' || typeof value === 'function') {
        if (this.factories) this.factories.delete(value);
        if (this.protected) this.protected.delete(value);
      }
      this.values.delete(key);
      this.frozen.delete(key);
      this._raw.delete(key);
      this._keys = this._keys.filter(item => item !== key);
    }
  }

  /**
   * Marks a function as a factory that will be called each time it's accessed.
   * @param factory - The factory function to register
   * @returns The factory function
   * @throws {Error} If the factory is not a function
   */
  factory<T>(factory: Factory<T>): Factory<T> {
    if (typeof factory !== 'function') {
      throw new ExpectInvocableError();
    }
    this.factories.set(factory, true);
    return factory;
  }

  /**
   * Marks a callable as protected, preventing it from being executed.
   * @param callable - The callable to protect
   * @returns The protected callable
   * @throws {Error} If the callable is not a function
   */
  protect(callable: Callable): Callable {
    if (typeof callable !== 'function') {
      throw new ExpectInvocableError();
    }
    this.protected.set(callable, true);
    return callable;
  }

  /**
   * Gets the raw value (original factory function) before resolution.
   * @param key - The key to get the raw value for
   * @returns The raw value or factory function
   * @throws {Error} If the key is not defined
   */
  raw<T>(key: DependencyKey): T {
    if (!this.values.has(key) && !this._raw.has(key)) {
      throw new KeyIsNotDefinedError(key);
    }
    if (this._raw.has(key)) {
      return this._raw.get(key) as T;
    }
    return this.values.get(key) as T;
  }

  /**
   * Gets all registered keys in the container.
   * @returns Array of all registered keys
   */
  keys(): DependencyKey[] {
    return Array.from(new Set([...this._keys, ...Array.from(this.values.keys())]));
  }

  /**
   * Registers a service provider and optional values.
   * @param provider - The service provider to register
   * @param values - Optional additional values to register
   * @returns The container instance for chaining
   */
  register(
    provider: ServiceProviderInterface,
    values: Record<string, ValueOrFactoryOrCallable<any>> = {},
  ): this {
    provider.register(this as any);
    Object.entries(values).forEach(([key, value]) => {
      this.set(key, value);
    });
    return this;
  }

  /**
   * Clears all registered services and resets the container to its initial state.
   */
  clear(): void {
    this.values.clear();
    this.classInstanceCache.clear();
    this.factories.clear();
    this.protected.clear();
    this.frozen.clear();
    this._raw.clear();
    this._keys.length = 0;
    this.dependencyMap.clear();
    this.valueObjects.clear();
  }

  /**
   * Disposes of the container and cleans up resources.
   */
  dispose(): void {
    this.clear();
  }
}
