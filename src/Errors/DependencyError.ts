export class DependencyError extends Error {
  constructor(constructorName: string) {
    super(
      `Could not resolve dependencies for ${constructorName}. Ensure it is a class and metadata is emitted.`,
    );
  }
}
