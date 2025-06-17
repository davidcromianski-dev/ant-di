import { IServiceProvider, Factory, Callable, ValueOrFactoryOrCallable } from './interfaces';
import enUsMessages from './i18n/en-us';

export class Container {
    private currentLang: string = 'en-us';
    private localizedMessages: any = enUsMessages;
    private values = new Map<string, any>(); // For string-keyed services
    private classInstanceCache = new Map<Function, any>(); // For constructor-keyed singletons
    private factories: Map<Factory<any>, boolean>;
    private protected: Map<Callable, boolean>;
    private frozen = new Map<string, ValueOrFactoryOrCallable<any>>();
    private _raw= new Map<string, ValueOrFactoryOrCallable<any>>();
    private _keys: string[] = [];

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

    public async setLanguage(lang: string): Promise<void> {
        if (lang === 'en-us') {
            this.localizedMessages = enUsMessages;
            this.currentLang = lang;
        } else {
            console.warn(`Language ${lang} not supported. Keeping ${this.currentLang}.`);
        }
    }

    offsetSet<T>(key: string, value: ValueOrFactoryOrCallable<T>): void {
        if (this.frozen.has(key)) {
            throw new Error(this.localizedMessages.keyFrozen(key));
        }
        this.values.set(key, value);
        if (!this._keys.includes(key)) {
            this._keys.push(key);
        }
    }

    private _autoWire<T>(constructor: { new(...args: any[]): T }, resolutionPath: string[]): T {
        const constructorName = constructor.name;
        if (resolutionPath.includes(constructorName)) {
            throw new Error(this.localizedMessages.circularDependency(resolutionPath.join(' -> '), constructorName));
        }
        resolutionPath.push(constructorName);
        const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', constructor);
        if (!paramTypes) {
            resolutionPath.pop();
            throw new Error(this.localizedMessages.couldNotResolveForConstructor(constructorName));
        }
        const resolvedParams = paramTypes.map(paramType => {
            if (paramType === undefined) {
                 resolutionPath.pop();
                 throw new Error(this.localizedMessages.failedToResolveDueToUndefinedParam(constructorName));
            }
            try {
                return this.offsetGet(paramType, [...resolutionPath]);
            } catch (e) {
                resolutionPath.pop();
                throw new Error(this.localizedMessages.failedToResolveDependency(paramType?.name || 'unknown', constructorName, (e as Error).message));
            }
        });
        const instance = new constructor(...resolvedParams);
        resolutionPath.pop();
        return instance;
    }

    offsetGet<T>(key: string | { new(...args: any[]): T }, resolutionPath: string[] = []): T {
        if (typeof key === 'function') {
            // Handle constructor or factory function key
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
                        // Not caching result of factory-by-name here in classInstanceCache by default
                        return valueByName(this) as T;
                    } else {
                        return valueByName as unknown as T; // Protected factory
                    }
                }
            }

            if (this.factories.has(key as unknown as Factory<any>)) {
                const factoryFn = key as unknown as Factory<any>;
                if (!this.protected.has(factoryFn)) {
                    return factoryFn(this) as T;
                }
                return factoryFn as unknown as T; // Protected factory
            }

            if (typeof key.prototype !== 'undefined') { // Check if it's a class constructor
                try {
                    const instance = this._autoWire(key as { new(...args: any[]): T }, resolutionPath);
                    this.classInstanceCache.set(key, instance);
                    if (!this._keys.includes(cacheKeyByName)) {
                        this._keys.push(cacheKeyByName);
                    }
                    return instance;
                } catch (e) {
                    throw new Error(this.localizedMessages.autoWiringFailed(key.name, (e as Error).message));
                }
            }
            throw new Error(this.localizedMessages.keyIsNotDefined(key.name)); // Unresolvable function key

        } else { // key is a string
            const cacheKey = key;
            if (this.values.has(cacheKey)) {
                const cachedValue = this.values.get(cacheKey);
                if (this.factories.has(cachedValue)) {
                    if (!this.protected.has(cachedValue)) {
                        return cachedValue(this) as T;
                    }
                    return cachedValue as unknown as T; // Protected factory
                }
                return cachedValue as T; // Direct value
            }

            // Fallback for string keys that might represent raw functions (original implicit factory behavior)
            // This was the original Pimple behavior: a service definition (function) is replaced by its result on first get.
            // For this to work, the function must have been initially set via offsetSet(key, rawFunction)
            // and this.values.get(key) above would have returned that rawFunction.
            // The check `!this.factories.has(cachedValue)` above would be true.
            // The check `!this.protected.has(cachedValue)` would be true.
            // So it would have been returned by `return cachedValue as T;`
            // This means the raw function itself is returned if it's not called.
            // This is not what Pimple does. Pimple calls it.
            // The previous `offsetGet` had this logic more explicitly for string keys:
            // if (typeof value === 'function' && !this.factories.has(value) && !this.protected.has(value)) {
            //    const raw = value; result = raw(this); this.values.set(key, result); this._raw.set(key,raw)...
            // }
            // This implicit factory execution for string keys is missing from the current refactor of the string path.
            // Let's re-add it:
            const rawValue = this.values.get(cacheKey); // This will be undefined if not in values
            if (typeof rawValue === 'function' && !this.factories.has(rawValue) && !this.protected.has(rawValue)) {
                const result = rawValue(this);
                this.values.set(cacheKey, result); // Cache the result
                if (!this._raw.has(cacheKey)) { // Store the original raw function
                    this._raw.set(cacheKey, rawValue as ValueOrFactoryOrCallable<any>);
                }
                this.frozen.set(cacheKey, true); // Mark as frozen
                return result as T;
            }
            // If not in values, and not an implicit factory that was missed:
            throw new Error(this.localizedMessages.keyIsNotDefined(cacheKey));
        }
    }

    offsetExists(key: string): boolean {
        return this._keys.includes(key) || this.values.has(key) || this.classInstanceCache.has(key as any); // key might be constructor
    }

    offsetUnset(key: string): void {
        if (this._keys.includes(key)) {
            const value = this.values.get(key); // String key
            if (typeof value === 'object' || typeof value === 'function') {
                 if (this.factories) this.factories.delete(value);
                 if (this.protected) this.protected.delete(value);
            }
            // Also attempt to find a class constructor if key is a name
            // This part is tricky because _keys can have Class.name.
            // For now, unset primarily works reliably for string keys used in offsetSet.
            this.values.delete(key);
            this.frozen.delete(key);
            this._raw.delete(key);
            this._keys = this._keys.filter((item) => item !== key);
            // Should also clear from classInstanceCache if key is a class name
            // This requires iterating classInstanceCache or having a reverse map.
            // For simplicity, direct class constructor unset: container.unset(MyClass) is not supported by this string key method.
        }
    }

    factory<T>(factory: Factory<T>): Factory<T> {
        if (typeof factory !== 'function') {
            throw new Error(this.localizedMessages.expectedInvokable);
        }
        this.factories.set(factory, true);
        return factory;
    }

    protect(callable: Callable): Callable {
        if (typeof callable !== 'function') {
            throw new Error(this.localizedMessages.expectedInvokable);
        }
        this.protected.set(callable, true);
        return callable;
    }

    raw<T>(key: string): T {
        if (!this.values.has(key) && !this._raw.has(key)) { // Check both, as _raw might have original factory
             throw new Error(this.localizedMessages.keyIsNotDefined(key));
        }
        if (this._raw.has(key)) { // Prefer _raw if it exists
            return this._raw.get(key) as T;
        }
        return this.values.get(key) as T;
    }

    keys(): string[] {
        // This should return all keys known to the container, including string keys for services,
        // names of auto-wired classes, etc.
        return Array.from(new Set([...this._keys, ...Array.from(this.values.keys())]));
    }

    register(provider: IServiceProvider, values: Record<string, ValueOrFactoryOrCallable<any>> = {}): Container {
        provider.register(this as any); // Cast to any due to interface mismatch (Container vs any)
        Object.entries(values).forEach(([key, value]) => {
            this.offsetSet(key, value);
        });
        return this;
    }
}
