export type ValueOrFactory<T> = T | (() => T) | ((container: Container) => T);

export interface Provider {
    register(container: Container): Container;
}

export class Container {
    private registry = new Map<string, ValueOrFactory<any>>();
    private singletons = new Map<string, any>();

    /**
     * Register a value or factory in the container.
     */
    set<T>(key: string, value: ValueOrFactory<T>): void {
        if (this.registry.has(key)) {
            throw new Error(`Key "${key}" is already registered.`);
        }
        this.registry.set(key, value);
    }

    /**
     * Get a value from the container.
     */
    get<T>(key: string): T {
        if (!this.exists(key)) {
            throw new Error(`Key "${key}" does not exist in the container.`);
        }

        // Verificar se é singleton
        if (this.singletons.has(key)) {
            return this.singletons.get(key);
        }

        const value = this.registry.get(key);

        // Se for função ou fábrica, executar
        if (typeof value === 'function') {
            const resolvedValue = value instanceof Function ? value(this) : value();
            this.singletons.set(key, resolvedValue);
            return resolvedValue;
        }

        return value;
    }

    /**
     * Check if a key exists in the container.
     */
    exists(key: string): boolean {
        return this.registry.has(key);
    }

    /**
     * List all values in the container.
     */
    list(): Record<string, any> {
        const result: Record<string, any> = {};
        this.registry.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }

    /**
     * List all keys in the container.
     */
    keys(): string[] {
        return Array.from(this.registry.keys());
    }

    /**
     * Calls the register method from the provider.
     */
    register(provider: Provider): void {
        provider.register(this);
    }
}
