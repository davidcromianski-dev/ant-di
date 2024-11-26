interface ServiceProviderInterface {
    register(container: Container): Container;
}

type Factory<T> = (container: Container) => T;

type Callable = ((...args: any[]) => any);

type ValueOrFactoryOrCallable<T> = T | Factory<T> | Callable;

const messages = {
    expectedInvokable: 'Callable is not a Closure or invokable object.',
    keyFrozen: (key: string) => `Key "${key}" is frozen and cannot be modified.`,
    keyIsNotDefined: (key: string) => `Key "${key}" is not defined.`,
}

class Container {
    private values = new Map<string, any>();
    private factories;
    private protected;
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

    offsetSet<T>(key: string, value: ValueOrFactoryOrCallable<T>): void {
        if (this.frozen.has(key)) {
            throw new Error(messages.keyFrozen(key));
        }

        this.values.set(key, value);
        this._keys.push(key);
    }

    offsetGet<T>(key: string): T {
        if (!this.offsetExists(key)) {
            throw new Error(messages.keyFrozen(key));
        }

        if (
            Object.keys(this._raw).includes(key)
            || this.protected.has(this.values.get(key))
            || typeof this.values.get(key) !== 'function'
        ) {
            return this.values.get(key);
        }

        if (this.factories.has(this.values.get(key))) {
            return this.values.get(key)(this);
        }

        const raw = this.values.get(key);
        const value = this.values
            .set(key, raw(this))
            .get(key);

        this._raw.set(key, raw);

        this.frozen.set(key, true);

        return value;
    }

    offsetExists(key: string): boolean {
        return this._keys.includes(key);
    }

    offsetUnset(key: string): void {
        if (this._keys.includes(key)) {
            if (typeof this.values.get(key) === 'object') {
                this.factories.delete(this.values.get(key));
                this.protected.delete(this.values.get(key));
            }

            this.values.delete(key);
            this.frozen.delete(key);
            this._raw.delete(key);
            this._keys = this._keys.filter((item) => item !== key);
        }
    }

    factory<T>(factory: Factory<T>): Factory<T> {
        if (typeof factory !== 'function') {
            throw new Error(messages.expectedInvokable);
        }

        this.factories.set(factory, true);

        return factory;
    }

    protect(callable: Callable): Callable {
        if (typeof callable !== 'function') {
            throw new Error(messages.expectedInvokable);
        }

        this.protected.set(callable, true);

        return callable;
    }

    raw<T>(key: string): T {
        if (!this._keys.includes(key)) {
            throw new Error(messages.keyIsNotDefined(key));
        }

        if (this._raw.has(key)) {
            return this._raw.get(key);
        }

        return this.values.get(key);
    }

    keys(): string[] {
        return Array.from(this.values.keys());
    }

    register(provider: ServiceProviderInterface, values: Record<string, ValueOrFactoryOrCallable<any>> = {}): Container {
        provider.register(this);

        Object.entries(values).forEach(([key, value]) => {
            this.offsetSet(key, value);
        });

        return this;
    }
}

export { Container, ServiceProviderInterface, Factory, Callable, ValueOrFactoryOrCallable };
