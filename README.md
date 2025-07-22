# Ant DI

## Simple JavaScript Dependency Injection Package

This package is a simple dependency injection container for JavaScript and TypeScript. It is inspired by the PHP Pimple package and provides advanced features like auto-wiring, service providers, and internationalization.

![ant-di](https://github.com/user-attachments/assets/ed38e310-6c24-4b7e-a90f-fc524c811393)

## Features

- **Simple and lightweight** - Easy to use dependency injection container
- **Auto-wiring** - Manual dependency resolution for TypeScript classes (automatic depends on `reflect-metadata`, that is currently not supported and experimental)
- **Internationalization** - Multi-language error messages (EN, PT-BR, ES)
- **Factory support** - Create new instances on each request
- **Protected callables** - Store functions without executing them
- **Frozen keys** - Prevent modification after first resolution
- **Service providers** - Modular service registration
- **Comprehensive testing** - Full test coverage with Poku
- **Rich examples** - Multiple usage patterns and real-world scenarios

## Installation

```bash
# NPM
npm install @davidcromianski-dev/ant-di
# PNPM
pnpm i @davidcromianski-dev/ant-di
```

## Dependencies

### Runtime Dependencies
This package has **zero runtime dependencies**, making it lightweight and avoiding dependency conflicts.

### Development Dependencies
The following dependencies are used for development, testing, and building:

- **[poku](https://github.com/antfu/poku)** `^3.0.2` - Fast test runner for Node.js
- **[reflect-metadata](https://github.com/rbuckton/reflect-metadata)** `^0.2.2` - Polyfill for Metadata Reflection API
- **[ts-node](https://github.com/TypeStrong/ts-node)** `^10.9.2` - TypeScript execution engine for Node.js
- **[tsx](https://github.com/esbuild-kit/tsx)** `^4.20.3` - TypeScript execution engine with esbuild
- **[typescript](https://github.com/microsoft/TypeScript)** `^5.7.2` - TypeScript compiler
- **[vite](https://github.com/vitejs/vite)** `^4.5.5` - Build tool and dev server
- **[vite-plugin-dts](https://github.com/qmhc/vite-plugin-dts)** `^4.3.0` - TypeScript declaration file generation for Vite

### Optional Dependencies
- **reflect-metadata** - Required only if you want to use decorator-based dependency injection instead of manual registration (currently not supported and experimental)

## Quick Start

```typescript
import { Container } from '@davidcromianski-dev/ant-di';

// Create container
const container = new Container();

// Register a service
container.offsetSet('database', () => new DatabaseConnection());

// Get the service
const db = container.offsetGet('database');

// Auto-wiring example
class UserService {
    constructor(private db: DatabaseConnection) {}
}

container.registerDependencies(UserService, [DatabaseConnection]);
const userService = container.offsetGet(UserService);
```

## Container

The container is the main class of the package. It is used to store the services and parameters of the application.

### Creating a Container

```typescript
import { Container } from '@davidcromianski-dev/ant-di';

// Empty container
const container = new Container();

// Container with initial values
const container = new Container({
    'app.name': 'My Application',
    'app.version': '1.0.0'
});
```

### Basic Operations

#### Registering Services
To register services in the container, you can use the `offsetSet` method:

```typescript
// Simple value
container.offsetSet('app.name', 'My Application');

// Factory function
container.offsetSet('database', () => new DatabaseConnection());

// Class constructor
container.offsetSet('logger', Logger);
```

#### Getting Services
To get services from the container, you can use the `offsetGet` method:

```typescript
// Get by string key
const appName = container.offsetGet('app.name');

// Get by class constructor (auto-wiring)
const logger = container.offsetGet(Logger);
```

> [!NOTE]
> If the service is a factory, it will be executed every time it is requested.

> [!CAUTION]
> If the service is not in the container, an exception will be thrown.

#### Checking Service Existence
To check if a service is registered in the container, you can use the `offsetExists` method:

```typescript
const exists = container.offsetExists('service');
```

#### Removing Services
To remove services from the container, you can use the `offsetUnset` method:

```typescript
container.offsetUnset('service');
```

### Auto-wiring

Ant DI supports manual dependency injection for TypeScript classes. You can register dependencies manually.

#### Manual Dependency Registration

```typescript
class UserService {
    constructor(private db: DatabaseConnection, private logger: Logger) {}
}

// Register dependencies manually
container.registerDependencies(UserService, [DatabaseConnection, Logger]);

// Get instance with auto-wired dependencies
const userService = container.offsetGet(UserService);
```

#### Dependency Registration by Name

```typescript
container.registerDependenciesByName('UserService', [DatabaseConnection, Logger]);
const userService = container.offsetGet(UserService);
```

#### Circular Dependency Detection

```typescript
class ServiceA {
    constructor(public serviceB: ServiceB) {}
}

class ServiceB {
    constructor(public serviceA: ServiceA) {}
}

// This will throw a circular dependency error
container.registerDependencies(ServiceA, [ServiceB]);
container.registerDependencies(ServiceB, [ServiceA]);
```

### Factory and Protection

#### Registering Factories
To register factories in the container, you can use the `factory` method:

```typescript
const factory = (c: Container) => new Service();
container.factory(factory);
container.offsetSet('service', factory);
```

> [!TIP]
> Useful for services that need to be created every time they are requested.

#### Protecting Services
To protect services in the container, you can use the `protect` method:

```typescript
const callable = (c: Container) => new Service();
container.protect(callable);
container.offsetSet('service', callable);
```

> [!TIP]
> By default, Ant DI assumes that any callable added to the container is a factory for a service, and it will invoke it when the key is accessed.
> The `protect()` method overrides this behavior, allowing you to store the callable itself.

#### Frozen Keys
Keys become frozen after first resolution of implicit factories:

```typescript
// This creates an implicit factory
container.offsetSet('service', (c: Container) => new Service());

// First access - works fine
const service = container.offsetGet('service');

// Second access - throws error (key is frozen)
container.offsetSet('service', 'new value'); // Error!
```

### Getting Raw Values
To get raw values from the container, you can use the `raw` method:

```typescript
const rawValue = container.raw('service');
```

> [!TIP]
> Useful when you need access to the underlying value (such as a closure or callable) itself, rather than the result of its execution.

### Getting All Keys
To get all keys registered in the container, you can use the `keys` method:

```typescript
const keys = container.keys();
```

### Service Providers

Service providers allow you to organize the registration of services in the container.

```typescript
import { Container, IServiceProvider } from '@davidcromianski-dev/ant-di';

class DatabaseServiceProvider implements IServiceProvider {
    register(container: Container) {
        container.offsetSet('db.host', 'localhost');
        container.offsetSet('db.port', 5432);
        
        const connectionFactory = (c: Container) => ({
            host: c.offsetGet('db.host'),
            port: c.offsetGet('db.port'),
            connect: () => `Connected to ${c.offsetGet('db.host')}:${c.offsetGet('db.port')}`
        });
        
        container.factory(connectionFactory);
        container.offsetSet('db.connection', connectionFactory);
    }
}

// Register the service provider
container.register(new DatabaseServiceProvider());

// Use the services
const connection = container.offsetGet('db.connection');
console.log(connection.connect());
```

### Internationalization

Ant DI supports multiple languages for error messages. Currently supported languages:
- English (en-us) - Default
- Portuguese (pt-br)
- Spanish (es-es)

```typescript
// Set language
await container.setLanguage('pt-br');

// Get current language
const currentLang = container.getLanguage();

// Error messages will now be in Portuguese
try {
    container.offsetGet('nonexistent');
} catch (error) {
    console.log(error.message); // "A chave "nonexistent" não está definida."
}
```

### Proxy Access

The container supports proxy access for convenient property-style access:

```typescript
// Set value
container.appName = 'My App';

// Get value
console.log(container.appName); // "My App"
```

## Testing

The project uses [Poku](https://github.com/antfu/poku) for testing. All tests are located in the `tests/` directory.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

Tests are organized into logical groups:

- **Basic Operations** - Core container functionality
- **Factory Operations** - Factory and protection features
- **Auto-wiring** - Dependency injection and resolution
- **Frozen Keys** - Key freezing behavior
- **Proxy Access** - Proxy functionality
- **Constructor Initialization** - Container initialization
- **Service Providers** - Service provider registration
- **Internationalization** - Language support

### Example Test

```typescript
import { test, assert } from 'poku';
import { Container } from '../src/index';

describe('Container', () => {
    describe('Basic Operations', () => {
        it('should set and get a value', () => {
            const container = new Container();
            container.offsetSet('key', 'value');
            const value = container.offsetGet('key');
            assert.equal(value, 'value');
        });
    });
});
```

## Examples

Comprehensive examples are available in the `examples/` directory:

### Basic Usage
```bash
npx ts-node examples/basic-usage.ts
```
Demonstrates simple value storage, factory functions, and basic container operations.

### Dependency Injection
```bash
npx ts-node examples/dependency-injection.ts
```
Shows auto-wiring, manual dependency registration, and circular dependency detection.

### Factories and Protection
```bash
npx ts-node examples/factories-and-protection.ts
```
Explains factory functions, protected callables, and frozen key behavior.

### Service Providers
```bash
npx ts-node examples/service-providers.ts
```
Demonstrates modular service registration using service providers.

### Internationalization
```bash
npx ts-node examples/internationalization.ts
```
Shows multi-language support and error message localization.

### Advanced Patterns
```bash
npx ts-node examples/advanced-patterns.ts
```
Real-world scenarios including event systems and complex dependency graphs.

### Run All Examples
```bash
npx ts-node examples/index.ts
```

## API Reference

### Container Class

#### Constructor
```typescript
new Container(values?: Record<string, ValueOrFactoryOrCallable<any>>)
```

#### Methods

- `offsetSet<T>(key: string, value: ValueOrFactoryOrCallable<T>): void`
- `offsetGet<T>(key: string | Constructor<T>, resolutionPath?: string[]): T`
- `offsetExists(key: string): boolean`
- `offsetUnset(key: string): void`
- `factory<T>(factory: Factory<T>): Factory<T>`
- `protect(callable: Callable): Callable`
- `raw<T>(key: string): T`
- `keys(): string[]`
- `register(provider: IServiceProvider, values?: Record<string, ValueOrFactoryOrCallable<any>>): Container`
- `registerDependencies(constructor: Function, dependencies: any[]): void`
- `registerDependenciesByName(className: string, dependencies: any[]): void`
- `setLanguage(lang: keyof typeof Container.langs): Promise<void>`
- `getLanguage(): keyof typeof Container.langs`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License. For more details, see the LICENSE file.
