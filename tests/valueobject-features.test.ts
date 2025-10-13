import { assert, describe, it } from 'poku';
import { Container, ValueObject } from '../src';

// Test classes for ValueObject functionality
class DatabaseService {
  constructor(public config: any) {}
}

class UserService {
  constructor(public db: DatabaseService) {}
}

class OrderService {
  constructor(
    public userService: UserService,
    public db: DatabaseService,
  ) {}
}

describe('📦 Container - ValueObject Features', () => {
  it('should create ValueObject with dependencies', () => {
    const container = new Container();
    container.set('dbConfig', { host: 'localhost', port: 5432 });

    const valueObject = new ValueObject(container, 'DatabaseService', DatabaseService);
    valueObject.addDependency('dbConfig');

    assert.equal(valueObject.hasDependency('dbConfig'), true);
    assert.equal(valueObject.getDependencyKeys().length, 1);
    assert.equal(valueObject.isResolvable(), true);
  });

  it('should validate dependencies correctly', () => {
    const container = new Container();

    const valueObject = new ValueObject(container, 'UserService', UserService);
    valueObject.addDependency('NonExistentService');

    assert.equal(valueObject.validateDependencies(), false);
    assert.equal(valueObject.isResolvable(), false);
  });

  it('should resolve dependencies and create instances', () => {
    const container = new Container();
    container.set('dbConfig', { host: 'localhost', port: 5432 });
    container.set('DatabaseService', DatabaseService, false, ['dbConfig']);

    const valueObject = container.getValueObject('DatabaseService');
    assert.notEqual(valueObject, undefined);

    const instance = valueObject!.getValue();
    assert.equal(instance instanceof DatabaseService, true);
    assert.equal((instance as any).config.host, 'localhost');
  });

  it('should handle dependency management operations', () => {
    const container = new Container();

    const valueObject = new ValueObject(container, 'TestService', UserService);

    // Add dependencies
    valueObject.addDependency('dep1').addDependency('dep2');
    assert.equal(valueObject.getDependencyKeys().length, 2);

    // Remove dependency
    valueObject.removeDependency('dep1');
    assert.equal(valueObject.getDependencyKeys().length, 1);
    assert.equal(valueObject.hasDependency('dep1'), false);
    assert.equal(valueObject.hasDependency('dep2'), true);

    // Clear all dependencies
    valueObject.clearDependencies();
    assert.equal(valueObject.getDependencyKeys().length, 0);
  });

  it('should clone ValueObject correctly', () => {
    const container = new Container();

    const original = new ValueObject(container, 'TestService', UserService);
    original.addDependency('dep1').addDependency('dep2');

    const cloned = original.clone();

    assert.notEqual(original, cloned);
    assert.equal(cloned.getKey(), original.getKey());
    assert.equal(cloned.getDependencyKeys().length, original.getDependencyKeys().length);
    assert.equal(cloned.hasDependency('dep1'), true);
    assert.equal(cloned.hasDependency('dep2'), true);
  });

  it('should handle singleton behavior', () => {
    const container = new Container();
    container.set('dbConfig', { host: 'localhost', port: 5432 });

    const valueObject = new ValueObject(container, 'DatabaseService', DatabaseService);
    valueObject.addDependency('dbConfig').asSingleton();

    const instance1 = valueObject.getValue();
    const instance2 = valueObject.getValue();

    assert.equal(instance1, instance2); // Same instance
    assert.equal(instance1 instanceof DatabaseService, true);
  });

  it('should handle factory behavior', () => {
    const container = new Container();

    const factory = (_c: Container) => new DatabaseService({ host: 'factory-host' });
    const valueObject = new ValueObject(container, 'DatabaseService', factory);
    valueObject.asFactory();

    const instance1 = valueObject.getValue();
    const instance2 = valueObject.getValue();

    assert.notEqual(instance1, instance2); // Different instances
    assert.equal(instance1 instanceof DatabaseService, true);
    assert.equal(instance2 instanceof DatabaseService, true);
  });

  it('should detect circular dependencies', () => {
    const container = new Container();

    // Register the service first
    container.set('TestService', UserService);

    const valueObject = new ValueObject(container, 'TestService', UserService);
    valueObject.addDependency('TestService'); // Self-reference

    // Manually set up circular dependency by adding to resolution path
    valueObject.resolutionPath.push('TestService');

    // Should detect circular dependency during resolution
    assert.throws(() => {
      valueObject.resolveDependencies();
    }, /Circular dependency detected/);
  });

  it('should work with Container integration', () => {
    const container = new Container();

    // Register services with dependencies
    container.set('dbConfig', { host: 'localhost', port: 5432 });
    container.set('DatabaseService', DatabaseService, false, ['dbConfig']);
    container.set('UserService', UserService, false, ['DatabaseService']);

    // Get ValueObjects
    const dbValueObject = container.getValueObject('DatabaseService');
    const userValueObject = container.getValueObject('UserService');

    assert.notEqual(dbValueObject, undefined);
    assert.notEqual(userValueObject, undefined);

    // Test dependency resolution
    const dbInstance = container.get('DatabaseService');
    const userInstance = container.get('UserService');

    assert.equal(dbInstance instanceof DatabaseService, true);
    assert.equal(userInstance instanceof UserService, true);
    assert.equal((userInstance as any).db instanceof DatabaseService, true);
  });
});
