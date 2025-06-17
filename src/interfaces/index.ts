export interface IServiceProvider {
    register(container: any): any; // Was Container
}

export type Factory<T> = (container: any) => T; // Was Container

export type Callable = ((...args: any[]) => any);

export type ValueOrFactoryOrCallable<T> = T | Factory<T> | Callable;
