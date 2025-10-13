import { Container, ValueObject } from '../src';

/**
 * Examples demonstrating ValueObject isolated logic methods and advanced dependency management
 */

// Service classes for demonstration
class DatabaseConfig {
  constructor(
    public _host: string,
    public _port: number,
    public _name: string,
  ) {}
}

class DatabaseConnection {
  constructor(public _config: DatabaseConfig) {}

  connect() {
    return `Connected to ${this.config.host}:${this.config.port}/${this.config.name}`;
  }
}

class UserRepository {
  constructor(public _db: DatabaseConnection) {}

  findById(id: number) {
    return this.db.connect() + ` - Finding user ${id}`;
  }
}

class UserService {
  constructor(
    public _userRepo: UserRepository,
    public _logger: any,
  ) {}

  getUser(id: number) {
    this.logger.log(`Getting user ${id}`);
    return this.userRepo.findById(id);
  }
}

function valueObjectExamples() {
  console.log('=== ValueObject Examples ===\n');

  const container = new Container();

  // 1. Basic ValueObject creation and dependency management
  console.log('1. Basic ValueObject Creation:');
  const dbConfigValueObject = new ValueObject(container, 'DatabaseConfig', DatabaseConfig);
  dbConfigValueObject.addDependency('host').addDependency('port').addDependency('name');

  console.log('✓ Created ValueObject for DatabaseConfig');
  console.log('✓ Dependencies:', dbConfigValueObject.getDependencyKeys());
  console.log('✓ Has host dependency:', dbConfigValueObject.hasDependency('host'));

  // Register dependencies
  container.set('host', 'localhost');
  container.set('port', 5432);
  container.set('name', 'myapp');

  console.log('✓ Is resolvable:', dbConfigValueObject.isResolvable());

  // 2. ValueObject dependency validation and resolution
  console.log('\n2. Dependency Validation and Resolution:');
  const dbConnectionValueObject = new ValueObject(
    container,
    'DatabaseConnection',
    DatabaseConnection,
  );
  dbConnectionValueObject.addDependency('DatabaseConfig');

  console.log('✓ Created ValueObject for DatabaseConnection');
  console.log(
    '✓ Is resolvable (should be false - DatabaseConfig not registered):',
    dbConnectionValueObject.isResolvable(),
  );

  // Register DatabaseConfig with dependencies
  container.set('DatabaseConfig', DatabaseConfig, false, ['host', 'port', 'name']);

  console.log(
    '✓ After registering DatabaseConfig, is resolvable:',
    dbConnectionValueObject.isResolvable(),
  );

  // 3. Container integration with ValueObjects
  console.log('\n3. Container Integration:');
  container.set('DatabaseConnection', DatabaseConnection, false, ['DatabaseConfig']);
  container.set('UserRepository', UserRepository, false, ['DatabaseConnection']);

  const dbConnection = container.get('DatabaseConnection');
  const userRepo = container.get('UserRepository');

  console.log('✓ DatabaseConnection instance:', dbConnection instanceof DatabaseConnection);
  console.log('✓ UserRepository instance:', userRepo instanceof UserRepository);
  console.log(
    '✓ UserRepository has db dependency:',
    (userRepo as any).db instanceof DatabaseConnection,
  );

  // 4. ValueObject retrieval and management
  console.log('\n4. ValueObject Retrieval and Management:');
  const dbValueObject = container.getValueObject('DatabaseConnection');
  const userRepoValueObject = container.getValueObject('UserRepository');

  console.log('✓ Retrieved DatabaseConnection ValueObject:', dbValueObject !== undefined);
  console.log('✓ Retrieved UserRepository ValueObject:', userRepoValueObject !== undefined);
  console.log('✓ DatabaseConnection dependencies:', dbValueObject?.getDependencyKeys());
  console.log('✓ UserRepository dependencies:', userRepoValueObject?.getDependencyKeys());

  // 5. Advanced ValueObject operations
  console.log('\n5. Advanced ValueObject Operations:');
  const advancedValueObject = new ValueObject(container, 'UserService', UserService);

  // Add multiple dependencies
  advancedValueObject.addDependency('UserRepository').addDependency('Logger').asSingleton();

  console.log('✓ Added multiple dependencies:', advancedValueObject.getDependencyKeys().length);
  console.log('✓ Is singleton:', advancedValueObject.singleton);

  // Register logger
  container.set('Logger', {
    log: (message: string) => console.log(`[LOG] ${new Date().toISOString()}: ${message}`),
  });

  // Register UserService
  container.set('UserService', UserService, false, ['UserRepository', 'Logger']);

  console.log('✓ Is resolvable:', advancedValueObject.isResolvable());

  // Create instance
  const userService = advancedValueObject.getValue();
  console.log('✓ UserService instance created:', userService instanceof UserService);
  console.log('✓ UserService result:', (userService as any).getUser(123));

  // 6. ValueObject cloning and dependency management
  console.log('\n6. ValueObject Cloning and Management:');
  const clonedValueObject = advancedValueObject.clone();

  console.log('✓ Cloned ValueObject');
  console.log(
    '✓ Clone has same dependencies:',
    JSON.stringify(clonedValueObject.getDependencyKeys()) ===
      JSON.stringify(advancedValueObject.getDependencyKeys()),
  );
  console.log('✓ Clone is singleton:', clonedValueObject.asSingleton);

  // Remove dependency
  clonedValueObject.removeDependency('Logger');
  console.log('✓ Removed Logger dependency');
  console.log('✓ Remaining dependencies:', clonedValueObject.getDependencyKeys());

  // Clear all dependencies
  clonedValueObject.clearDependencies();
  console.log('✓ Cleared all dependencies');
  console.log('✓ Dependencies count after clear:', clonedValueObject.getDependencyKeys().length);

  // 7. Circular dependency detection
  console.log('\n7. Circular Dependency Detection:');
  const circularValueObject = new ValueObject(container, 'CircularService', UserService);
  circularValueObject.addDependency('CircularService'); // Self-reference

  console.log('✓ Created ValueObject with circular dependency');

  try {
    circularValueObject.resolveDependencies();
  } catch (error: any) {
    console.log('✓ Caught circular dependency error:', error.message);
  }

  // 8. Factory pattern with ValueObjects
  console.log('\n8. Factory Pattern with ValueObjects:');
  const factoryValueObject = new ValueObject(
    container,
    'FactoryService',
    () => new DatabaseConfig('factory-host', 3306, 'factory-db'),
  );
  factoryValueObject.asFactory();

  console.log('✓ Created factory ValueObject');
  console.log('✓ Is factory:', factoryValueObject.factory);

  const instance1 = factoryValueObject.getValue();
  const instance2 = factoryValueObject.getValue();

  console.log('✓ Different instances:', instance1 !== instance2);
  console.log(
    '✓ Both are DatabaseConfig:',
    instance1 instanceof DatabaseConfig && instance2 instanceof DatabaseConfig,
  );

  console.log('\n✅ All ValueObject examples completed successfully!');
}

valueObjectExamples();
