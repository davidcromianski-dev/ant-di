export class ExpectInvokableError extends Error {
    constructor() {
        super('Callable is not a Closure or invokable object.');
    }
}

export class KeyFrozenError extends Error {
    constructor(key: string) {
        super(`Key "${key}" is frozen and cannot be modified.`);
    }
}

export class KeyIsNotDefinedError extends Error {
    constructor(key: string) {
        super(`Key "${key}" is not defined.`);
    }
}

export class CircularDependencyError extends Error {
    constructor(path: string, constructorName: string) {
        super(`Circular dependency detected: ${path} -> ${constructorName}`);
    }
}

export class DependencyError extends Error {
    constructor(constructorName: string) {
        super(`Could not resolve dependencies for ${constructorName}. Ensure it is a class and metadata is emitted.`);
    }
}

export class FailedToResolveDependencyError extends Error {
    constructor(paramTypeName: string, constructorName: string) {
        super(`Failed to resolve dependency ${paramTypeName} for ${constructorName}`);
    }
}

export class FailedToResolveDueToUndefinedParamError extends Error {
    constructor(constructorName: string) {
        super(`Failed to resolve dependency for ${constructorName} due to undefined paramType. This can happen with circular dependencies or if a class is not properly exported/imported.`);
    }
}

export class NoDependenciesRegisteredError extends Error {
    constructor(className: string) {
        super(`No dependencies registered for ${className}. Use container.bind(${className}, [dependencies]) to register dependencies manually.`);
    }
}