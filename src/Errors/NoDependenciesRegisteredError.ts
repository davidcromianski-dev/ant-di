export class NoDependenciesRegisteredError extends Error {
  constructor(className: string) {
    super(
      `No dependencies registered for ${className}. Use container.bind(${className}, [dependencies]) to register dependencies manually.`,
    );
  }
}
