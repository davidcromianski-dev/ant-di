# Ant DI

[![npm version](https://img.shields.io/npm/v/@davidcromianski-dev/ant-di.svg?style=flat-square)](https://www.npmjs.com/package/@davidcromianski-dev/ant-di)
[![npm downloads](https://img.shields.io/npm/dm/@davidcromianski-dev/ant-di.svg?style=flat-square)](https://www.npmjs.com/package/@davidcromianski-dev/ant-di)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@davidcromianski-dev/ant-di?style=flat-square)](https://www.npmjs.com/package/@davidcromianski-dev/ant-di)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)](https://www.npmjs.com/package/@davidcromianski-dev/ant-di)

## Simple JavaScript Dependency Injection Package

This package is a simple dependency injection container for JavaScript and TypeScript. It is inspired by the PHP Pimple package and provides advanced features like wiring and service providers.

![ant-di](https://github.com/user-attachments/assets/ed38e310-6c24-4b7e-a90f-fc524c811393)

## Features

- **Simple and lightweight** - Easy to use dependency injection container
- **Auto-wiring** - Manual dependency resolution for TypeScript classes with automatic singleton caching
- **Singleton behavior** - Automatic instance caching ensures classes return the same instance
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
pnpm add @davidcromianski-dev/ant-di
```

## Dependencies

### Runtime Dependencies
This package has **zero runtime dependencies**, making it lightweight and avoiding dependency conflicts.

### Development Dependencies
The following dependencies are used for development, testing, and building:

- **[poku](https://github.com/antfu/poku)** - Fast test runner for Node.js
- **[ts-node](https://github.com/TypeStrong/ts-node)** - TypeScript execution engine for Node.js
- **[tsx](https://github.com/esbuild-kit/tsx)** - TypeScript execution engine with esbuild
- **[typescript](https://github.com/microsoft/TypeScript)** - TypeScript compiler
- **[vite](https://github.com/vitejs/vite)** - Build tool and dev server
- **[vite-plugin-dts](https://github.com/qmhc/vite-plugin-dts)** - TypeScript declaration file generation for Vite

## Jest Compatibility

This package is fully compatible with Jest and other CommonJS-based testing frameworks. The build process generates both ESM and CommonJS outputs:

- **ESM**: `dist/index.es.js` - For modern bundlers and ES modules
- **CommonJS**: `dist/index.cjs.js` - For Jest, Node.js, and CommonJS environments

### Using with Jest

To use this package with Jest, simply import from the CommonJS build:

```typescript
// Jest test file
const { Container } = require('@davidcromianski-dev/ant-di');

describe('Container Tests', () => {
    it('should create a container instance', () => {
        const container = new Container();
        expect(container).toBeInstanceOf(Container);
    });
});
```

## Quick Start

```typescript
import { Container } from '@davidcromianski-dev/ant-di';

// Create container
const container = new Container();

// Register a service
container.set('database', () => new DatabaseConnection());

// Get the service
const db = container.get('database');

// Auto-wiring example
class UserService {
    constructor(private db: DatabaseConnection) {}
}

container.bind(UserService, [DatabaseConnection]);
const userService = container.get(UserService);
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
To register services in the container, you can use either the `set` method (recommended) or `offsetSet` method:

```typescript
// Simple value
container.set('app.name', 'My Application');

// Factory function (traditional method)
container.set('database', () => new DatabaseConnection());

// Factory function (direct method)
container.set('database', () => new DatabaseConnection(), true);

// Class constructor
container.set('logger', Logger);

// Legacy method (still supported)
container.offsetSet('app.name', 'My Application');
```

> [!NOTE]
> The `set` method is the recommended way to register services. The `offsetSet` method is maintained for backward compatibility.
>
> The third parameter `factory` (default: false) allows you to directly register a function as a factory without calling `container.factory()` first. When `factory=true`, the function will be executed each time the service is requested.

#### Getting Services
To get services from the container, you can use the `get` method:

```typescript
// Get by string key
const appName = container.get('app.name');

// Get by class constructor (auto-wiring)
const logger = container.get(Logger);
```

### Container Management
The container provides methods for managing its lifecycle:

```typescript
// Clear all registered services
container.clear();

// Dispose of the container (calls clear internally)
container.dispose();
```

> [!TIP]
> Use `clear()` when you want to reset the container to its initial state, and `dispose()` when you're completely done with the container instance.

> [!NOTE]
> If the service is a factory, it will be executed every time it is requested.

### Version Compatibility

#### Version 3.0.0+ (Current)
The following methods are the **recommended** way to interact with the container:

```typescript
// Service registration
container.set('key', value);
container.set('key', factory, true);

// Service retrieval
container.get('key');
container.get(Constructor);

// Service management
container.has('key');
container.unset('key');
```

#### Version < 3.0.0 (Legacy)
The following methods are **deprecated** but still supported for backward compatibility:

```typescript
// Deprecated methods (still work, but not recommended)
container.offsetSet('key', value);
container.offsetGet('key');
container.offsetExists('key');
container.offsetUnset('key');
```

> [!IMPORTANT]
> **Migration Guide**: All deprecated methods now internally call their modern equivalents:
> - `offsetSet()` → `set()`
> - `offsetGet()` → `get()`
> - `offsetExists()` → `has()`
> - `offsetUnset()` → `unset()`
>
> Your existing code will continue to work, but consider migrating to the new methods for better maintainability.

> [!CAUTION]
> If the service is not in the container, an exception will be thrown.

#### Checking Service Existence
To check if a service is registered in the container, you can use the `has` method:

```typescript
const exists = container.has('service');
```

#### Removing Services
To remove services from the container, you can use the `unset` method:

```typescript
container.unset('service');
```

### Auto-wiring

Ant DI supports manual dependency injection for TypeScript classes. You can register dependencies manually.

#### Manual Dependency Registration

```typescript
class UserService {
    constructor(private db: DatabaseConnection, private logger: Logger) {}
}

// Register dependencies manually
container.bind(UserService, [DatabaseConnection, Logger]);

// Get instance with auto-wired dependencies
const userService = container.get(UserService);
```

#### Dependency Binding by Name

For cases where you need to bind dependencies using class names as strings (useful for dynamic registration or avoiding circular import issues):

```typescript
// Alternative binding method using class name
container.bind('UserService', [DatabaseConnection, Logger]);

// Both binding methods achieve the same result
const userService = container.get(UserService);
```

> [!TIP]
> The `bind()` method accepts both constructor functions and class name strings, making it flexible for various use cases including dynamic class loading or avoiding potential circular import issues in complex applications.

#### Circular Dependency Detection

```typescript
class ServiceA {
    constructor(public serviceB: ServiceB) {}
}

class ServiceB {
    constructor(public serviceA: ServiceA) {}
}

// This will throw a circular dependency error
container.bind(ServiceA, [ServiceB]);
container.bind(ServiceB, [ServiceA]);
```

### Factory and Protection

#### Registering Factories
To register factories in the container, you can use multiple methods:

**Method 1: Using the `factory` method (traditional)**
```typescript
const factory = (c: Container) => new Service();
container.factory(factory);
container.set('service', factory);
```

**Method 2: Using `set` with factory parameter (recommended)**
```typescript
const factory = (c: Container) => new Service();
container.set('service', factory, true); // true = register as factory
```

> [!TIP]
> All three methods are equivalent. The `set` method with `factory=true` is the recommended approach as it provides a more direct way to register factories without needing to call `factory()` first.

> [!TIP]
> Useful for services that need to be created every time they are requested.

#### Protecting Services
To protect services in the container, you can use the `protect` method:

```typescript
const callable = (c: Container) => new Service();
container.protect(callable);
container.set('service', callable);
```

> [!TIP]
> By default, Ant DI assumes that any callable added to the container is a factory for a service, and it will invoke it when the key is accessed.
> The `protect()` method overrides this behavior, allowing you to store the callable itself.

#### Frozen Keys
Keys become frozen after first resolution of implicit factories:

```typescript
// This creates an implicit factory
container.set('service', (c: Container) => new Service());

// First access - works fine
const service = container.get('service');

// Second access - throws error (key is frozen)
container.set('service', 'new value'); // Error!
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
        container.set('db.host', 'localhost');
        container.set('db.port', 5432);
        
        const connectionFactory = (c: Container) => ({
            host: c.get('db.host'),
            port: c.get('db.port'),
            connect: () => `Connected to ${c.get('db.host')}:${c.get('db.port')}`
        });
        
        container.factory(connectionFactory);
        container.set('db.connection', connectionFactory);
    }
}

// Register the service provider
container.register(new DatabaseServiceProvider());

// Use the services
const connection = container.get('db.connection');
console.log(connection.connect());
```

### Singleton Behavior & Instance Caching

Ant DI automatically caches class instances to ensure singleton behavior:

```typescript
class DatabaseService {
    constructor() {
        console.log('DatabaseService created');
    }
}

// Register the class
container.bind(DatabaseService, []);

// First access - creates instance
const db1 = container.get(DatabaseService); // "DatabaseService created"

// Second access - returns cached instance
const db2 = container.get(DatabaseService); // No log (cached)

console.log(db1 === db2); // true - same instance
```

> [!TIP]
> Class instances are cached by their constructor function, ensuring that the same class always returns the same instance across the application.

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

### Example Test

```typescript
import { describe, it, assert } from 'poku';
import { Container } from '../src';

describe('Container', () => {
    describe('Basic Operations', () => {
        it('should set and get a value', () => {
            const container = new Container();
            container.set('key', 'value');
            const value = container.get('key');
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

##### Core Container Operations
- `set<T>(key: string, value: ValueOrFactoryOrCallable<T>, factory?: boolean): void` - **Recommended method** to register a value, factory, or callable in the container. The optional `factory` parameter (default: false) allows direct factory registration when set to true.
- `get<T>(key: string | Constructor<T>): T` - **Recommended method** to retrieve a service by key or class constructor with auto-wiring
- `has(key: string): boolean` - **Recommended method** to check if a key exists in the container
- `unset(key: string): void` - **Recommended method** to remove a key from the container

##### Legacy Methods (Deprecated since 3.0.0)
- `offsetSet<T>(key: string, value: ValueOrFactoryOrCallable<T>, factory?: boolean): void` - **Deprecated**. Use `set()` instead.
- `offsetGet<T>(key: string | Constructor<T>): T` - **Deprecated**. Use `get()` instead.
- `offsetExists(key: string): boolean` - **Deprecated**. Use `has()` instead.
- `offsetUnset(key: string): void` - **Deprecated**. Use `unset()` instead.

##### Factory and Protection
- `factory<T>(factory: Factory<T>): Factory<T>` - Mark a factory to always create new instances (prevents singleton caching)
- `protect(callable: Callable): Callable` - Protect a callable from being treated as a factory

##### Utility Methods
- `raw<T>(key: string): T` - Get the raw value without executing factories or callables
- `keys(): string[]` - Get all registered keys in the container
- `clear(): void` - Clear all registered services and reset the container to its initial state
- `dispose(): void` - Dispose of the container and clean up resources

##### Service Providers
- `register(provider: IServiceProvider, values?: Record<string, ValueOrFactoryOrCallable<any>>): Container` - Register a service provider with optional additional values

##### Dependency Injection
- `bind(target: Function | string, dependencies: any[]): void` - Bind dependencies for a class constructor or class name string

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License. For more details, see the LICENSE file.
