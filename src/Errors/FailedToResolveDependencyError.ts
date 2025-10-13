export class FailedToResolveDependencyError extends Error {
  constructor(paramTypeName: string, constructorName: string) {
    super(`Failed to resolve dependency ${paramTypeName} for ${constructorName}`);
  }
}
