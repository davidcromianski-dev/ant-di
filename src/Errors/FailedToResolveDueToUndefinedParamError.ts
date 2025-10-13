export class FailedToResolveDueToUndefinedParamError extends Error {
  constructor(constructorName: string) {
    super(
      `Failed to resolve dependency for ${constructorName} due to undefined paramType. This can happen with circular dependencies or if a class is not properly exported/imported.`,
    );
  }
}
