import { IServiceProvider, Factory, Callable, ValueOrFactoryOrCallable } from './interfaces';
import {
    AutoWiringError,
    CircularDependencyError, ExpectInvokableError, FailedToResolveDependencyError,
    FailedToResolveDueToUndefinedParamError,
    KeyFrozenError, KeyIsNotDefinedError,
    NoDependenciesRegisteredError
} from "./errors/Errors";

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
    private dependencyMap = new Map<Function | string, any[]>();

    /**
     * Creates a new container instance with optional initial values.
     * @param values - Initial key-value pairs to register in the container
     */
    constructor(values: Record<string, ValueOrFactoryOrCallable<any>> = {}) {
        this.factories = new Map<Factory<any>, boolean>();
        this.protected = new Map<Callable, boolean>();

        Object.entries(values).forEach(([key, value]) => {
            this.offsetSet(key, value);
        });

        return new Proxy(this, {
            get: (target, property) => {
                if (typeof property === 'string') {
                    if (target.offsetExists(property)) {
                        return target.offsetGet(property);
                    }
                }
                return target[property as keyof typeof target];
            },
            set: (target, property, value) => {
                if (typeof property === 'string') {
                    target.offsetSet(property, value);
                    return true;
                }
                return false;
            }
        });
    }

    /**
     * Binds dependencies for a constructor function or class name.
     * @param target - The constructor function or class name string to bind dependencies for
     * @param dependencies - Array of dependency types/constructors
     */
    bind(target: Function | string, dependencies: any[]): void {
        this.dependencyMap.set(target, dependencies);
    }

    /**
     * Sets a value or service in the container.
     * @param key - The key to associate with the value
     * @param value - The value, factory function, or callable to store
     * @param factory - Whether the value is a factory function
     * @throws {Error} If the key is frozen and cannot be modified
     */
    offsetSet<T>(key: string, value: ValueOrFactoryOrCallable<T>, factory: boolean = false): void {
        if (this.frozen.has(key)) {
            throw new KeyFrozenError(key);
        }
        this.values.set(key, (factory) ? this.factory(value as Factory<T>) : value);
        if (!this._keys.includes(key)) {
            this._keys.push(key);
        }
    }

    /**
     * Automatically wires dependencies for a constructor function.
     * @param constructor - The constructor function to auto-wire
     * @param resolutionPath - Current resolution path for circular dependency detection
     * @returns A new instance of the class with dependencies injected
     * @throws {Error} If circular dependencies are detected or dependencies cannot be resolved
     */
    private _autoWire<T>(constructor: { new(...args: any[]): T }, resolutionPath: string[]): T {
        const constructorName = constructor.name;
        if (resolutionPath.includes(constructorName)) {
            throw new CircularDependencyError(resolutionPath.join(' -> '), constructorName);
        }
        resolutionPath.push(constructorName);
        
        let paramTypes: any[] = [];
        if (this.dependencyMap.has(constructor)) {
            paramTypes = this.dependencyMap.get(constructor) || [];
        } else if (this.dependencyMap.has(constructorName as any)) {
            paramTypes = this.dependencyMap.get(constructorName as any) || [];
        } else {
            throw new NoDependenciesRegisteredError(constructorName);
        }
        
        if (!paramTypes || paramTypes.length === 0) {
            resolutionPath.pop();
            return new constructor();
        }
        
        const resolvedParams = paramTypes.map(paramType => {
            if (paramType === undefined) {
                resolutionPath.pop();
                throw new FailedToResolveDueToUndefinedParamError(constructorName);
            }
            try {
                return this.offsetGet(paramType, [...resolutionPath]);
            } catch (e) {
                resolutionPath.pop();
                throw new FailedToResolveDependencyError(paramType?.name || 'unknown', constructorName, (e as Error).message);
            }
        });
        const instance = new constructor(...resolvedParams);
        resolutionPath.pop();
        return instance;
    }

    /**
     * Retrieves a value or service from the container.
     * @param key - The key or constructor function to retrieve
     * @param resolutionPath - Current resolution path for circular dependency detection
     * @returns The resolved value or service instance
     * @throws {Error} If the key is not defined or dependencies cannot be resolved
     */
    offsetGet<T>(key: string | { new(...args: any[]): T }, resolutionPath: string[] = []): T {
        if (typeof key === 'function') {
            if (this.classInstanceCache.has(key)) {
                return this.classInstanceCache.get(key) as T;
            }

            const cacheKeyByName = key.name;
            if (this.values.has(cacheKeyByName)) {
                const valueByName = this.values.get(cacheKeyByName);
                if (valueByName instanceof key) {
                    this.classInstanceCache.set(key, valueByName);
                    return valueByName as T;
                }
                if (this.factories.has(valueByName) && typeof valueByName === 'function') {
                    if (!this.protected.has(valueByName)) {
                        return valueByName(this) as T;
                    } else {
                        return valueByName as unknown as T;
                    }
                }
            }

            if (this.factories.has(key as unknown as Factory<any>)) {
                const factoryFn = key as unknown as Factory<any>;
                if (!this.protected.has(factoryFn)) {
                    return factoryFn(this) as T;
                }
                return factoryFn as unknown as T;
            }

            if (typeof key.prototype !== 'undefined') {
                try {
                    const instance = this._autoWire(key as { new(...args: any[]): T }, resolutionPath);
                    this.classInstanceCache.set(key, instance);
                    if (!this._keys.includes(cacheKeyByName)) {
                        this._keys.push(cacheKeyByName);
                    }
                    return instance;
                } catch (e) {
                    throw new AutoWiringError(key.name, (e as Error).message);
                }
            }
            throw new KeyIsNotDefinedError(key.name);
        } else {
            const cacheKey = key;
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
    }

    /**
     * Checks if a key exists in the container.
     * @param key - The key to check
     * @returns True if the key exists, false otherwise
     */
    offsetExists(key: string): boolean {
        return this._keys.includes(key) || this.values.has(key) || this.classInstanceCache.has(key as any);
    }

    /**
     * Removes a key and its associated value from the container.
     * @param key - The key to remove
     */
    offsetUnset(key: string): void {
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
            this.offsetSet(key, value);
        });
        return this;
    }
}
