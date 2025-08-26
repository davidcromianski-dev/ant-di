import {
    CircularDependencyError, ExpectInvokableError, FailedToResolveDependencyError,
    FailedToResolveDueToUndefinedParamError,
    KeyFrozenError, KeyIsNotDefinedError,
    NoDependenciesRegisteredError
} from "./errors/Errors";
import { Callable, Constructor, Factory, IServiceProvider, ValueOrFactoryOrCallable } from './interfaces';

/**
 * Dependency injection container that supports auto-wiring, factories, and service providers.
 * Implements a Pimple-like interface with additional features for TypeScript.
 */
export class Container {
    /** Map of string keys to their corresponding values/services */
    private values = new Map<string, any>();

    /** Cache for singleton class instances keyed by constructor */
    private classInstanceCache = new Map<Function, any>();

    /** Map of factory functions to their registration status */
    private factories: Map<Factory<any>, boolean>;

    /** Map of protected callables to their protection status */
    private protected: Map<Callable, boolean>;

    /** Map of frozen keys that cannot be modified after first resolution */
    private frozen = new Map<string, ValueOrFactoryOrCallable<any>>();

    /** Map of original factory functions before resolution */
    private _raw = new Map<string, ValueOrFactoryOrCallable<any>>();

    /** Array of all registered keys */
    private _keys: string[] = [];

    /** Manual dependency registration map for constructors and class names */
    private dependencyMap = new Map<Constructor<any>, Constructor<any>[]>();

    /**
     * Creates a new container instance with optional initial values.
     * @param values - Initial key-value pairs to register in the container
     */
    constructor(values: Record<string, ValueOrFactoryOrCallable<any>> = {}) {
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
            }
        });
    }

    private _checkCircularDependency(target: Constructor<any>, dependencies: Constructor<any>[]): void {
        if (dependencies.includes(target)) {
            throw new CircularDependencyError(target.name, target.name);
        }
        for (const dependency of dependencies) {
            if (this.dependencyMap.has(dependency) && this.dependencyMap.get(dependency)?.includes(target)) {
                throw new CircularDependencyError(target.name, dependency.name);
            }
        }
    }

    /**
     * Automatically wires dependencies for a constructor function.
     * @param constructor - The constructor function to auto-wire
     * @param resolutionPath - Current resolution path for circular dependency detection
     * @returns A new instance of the class with dependencies injected
     * @throws {Error} If circular dependencies are detected or dependencies cannot be resolved
     */
    private _autoWire<T>(constructor: Constructor<any>): T {
        const constructorName = constructor.name;

        if (!this.dependencyMap.has(constructor)) {
            throw new NoDependenciesRegisteredError(constructorName);
        }

        const paramTypes = this.dependencyMap.get(constructor) || [];

        if (!paramTypes || paramTypes.length === 0) {
            return new constructor();
        }

        const resolvedParams = paramTypes.map((paramType) => {
            if (paramType === undefined) {
                throw new FailedToResolveDueToUndefinedParamError(constructorName);
            }

            if (typeof paramType === 'function' && 'name' in paramType) {
                return this.get(paramType.name);
            }

            throw new FailedToResolveDependencyError(paramType || 'unknown', constructorName);
        }) as Function[];

        return new constructor(...resolvedParams);
    }

    /**
     * Binds dependencies for a constructor function or class name.
     * @param target - The constructor function to bind dependencies for
     * @param dependencies - Array of dependency types/constructors
     */
    bind<T>(target: Constructor<T>, dependencies: Constructor<any>[]): void {
        if (typeof target !== 'function') {
            throw new ExpectInvokableError();
        }

        if (dependencies.length > 0 && dependencies.some(dep => typeof dep !== 'function')) {
            throw new ExpectInvokableError();
        }

        const key = target.name;
        if (this.frozen.has(key)) {
            throw new KeyFrozenError(key);
        }

        this._checkCircularDependency(target, dependencies);

        this.dependencyMap.set(target, dependencies);
        this.values.set(key, () => this._autoWire(target));

        if (!this._keys.includes(key)) {
            this._keys.push(key);
        }
    }

    /**
     * Sets a value or service in the container.
     * @param key - The key to associate with the value
     * @param value - The value, factory function, or callable to store
     * @param factory - Whether the value is a factory function
     * @throws {Error} If the key is frozen and cannot be modified
     * @deprecated Since 3.0.0. Use set() instead.
     */
    offsetSet<T>(key: string | Constructor<any>, value: ValueOrFactoryOrCallable<T>, factory: boolean = false): void {
        this.set(key, value, factory);
    }

    /**
     * Sets a value or service in the container (alias for offsetSet for consistency).
     * @param key - The key to associate with the value
     * @param value - The value, factory function, or callable to store
     * @param factory - Whether the value is a factory function
     * @throws {Error} If the key is frozen and cannot be modified
     */
    set<T>(key: string | Constructor<any>, value: ValueOrFactoryOrCallable<T>, factory: boolean = false): void {
        if (typeof key === 'function' && 'name' in key) {
            key = (key as { name: string }).name;
        }

        if (this.frozen.has(key)) {
            throw new KeyFrozenError(key);
        }

        this.values.set(key, (factory) ? this.factory(value as Factory<T>) : value);
        if (!this._keys.includes(key)) {
            this._keys.push(key);
        }
    }

    /**
     * Retrieves a value or service from the container.
     * @param key - The key or constructor function to retrieve
     * @param resolutionPath - Current resolution path for circular dependency detection
     * @returns The resolved value or service instance
     * @throws {Error} If the key is not defined or dependencies cannot be resolved
     * @deprecated Since 3.0.0. Use get() instead.
     */
    offsetGet<T>(key: string | Constructor<T>): T {
        return this.get(key);
    }

    /**
     * Retrieves a value or service from the container.
     * @param key - The key or constructor function to retrieve
     * @returns The resolved value or service instance
     * @throws {Error} If the key is not defined or dependencies cannot be resolved
     */
    get<T>(key: string | Constructor<T>): T {
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
                const result = cachedValue(this);
                this.values.set(cacheKey, result);
                if (!this._raw.has(cacheKey)) {
                    this._raw.set(cacheKey, cachedValue as ValueOrFactoryOrCallable<any>);
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
    offsetExists(key: string): boolean {
        return this.has(key);
    }

    /**
     * Checks if a key exists in the container.
     * @param key - The key to check
     * @returns True if the key exists, false otherwise
     */
    has(key: string): boolean {
        return this._keys.includes(key) || this.values.has(key) || this.classInstanceCache.has(key as any);
    }

    /**
     * Removes a key and its associated value from the container.
     * @param key - The key to remove
     * @deprecated Since 3.0.0. Use unset() instead.
     */
    offsetUnset(key: string): void {
        this.unset(key);
    }

    /**
     * Removes a key and its associated value from the container.
     * @param key - The key to remove
     */
    unset(key: string): void {
        if (this._keys.includes(key)) {
            const value = this.values.get(key);
            if (typeof value === 'object' || typeof value === 'function') {
                if (this.factories) this.factories.delete(value);
                if (this.protected) this.protected.delete(value);
            }
            this.values.delete(key);
            this.frozen.delete(key);
            this._raw.delete(key);
            this._keys = this._keys.filter((item) => item !== key);
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
            throw new ExpectInvokableError();
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
            throw new ExpectInvokableError();
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
    raw<T>(key: string): T {
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
    keys(): string[] {
        return Array.from(new Set([...this._keys, ...Array.from(this.values.keys())]));
    }

    /**
     * Registers a service provider and optional values.
     * @param provider - The service provider to register
     * @param values - Optional additional values to register
     * @returns The container instance for chaining
     */
    register(provider: IServiceProvider, values: Record<string, ValueOrFactoryOrCallable<any>> = {}): Container {
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
    }

    /**
     * Disposes of the container and cleans up resources.
     */
    dispose(): void {
        this.clear();
    }
}
