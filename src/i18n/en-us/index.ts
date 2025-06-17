const enUsMessages = {
    expectedInvokable: 'Callable is not a Closure or invokable object.',
    keyFrozen: (key: string) => `Key "${key}" is frozen and cannot be modified.`,
    keyIsNotDefined: (key: string) => `Key "${key}" is not defined.`,
    circularDependency: (path: string, constructorName: string) => `Circular dependency detected: ${path} -> ${constructorName}`,
    couldNotResolveForConstructor: (constructorName: string) => `Could not resolve dependencies for ${constructorName}. Ensure it is a class and metadata is emitted.`,
    failedToResolveDependency: (paramTypeName: string, constructorName: string, errorMsg: string) => `Failed to resolve dependency ${paramTypeName} for ${constructorName}: ${errorMsg}`,
    autoWiringFailed: (constructorName: string, errorMsg: string) => `Auto-wiring failed for ${constructorName}: ${errorMsg}`,
    failedToResolveDueToUndefinedParam: (constructorName: string) => `Failed to resolve dependency for ${constructorName} due to undefined paramType. This can happen with circular dependencies or if a class is not properly exported/imported.`
};
export default enUsMessages;
