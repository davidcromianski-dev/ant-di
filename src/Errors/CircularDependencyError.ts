export class CircularDependencyError extends Error {
  constructor(path: string, constructorName: string) {
    super(`Circular dependency detected: ${path} -> ${constructorName}`);
  }
}
