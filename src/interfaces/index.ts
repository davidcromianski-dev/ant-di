export interface IServiceProvider {
    register(container: any): any;
}

export type Factory<T> = (container: any) => T;

export type Callable = ((...args: any[]) => any);

export type ValueOrFactoryOrCallable<T> = T | Factory<T> | Callable;
