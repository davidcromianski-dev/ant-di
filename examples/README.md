# Container Examples

This directory contains comprehensive examples demonstrating various use cases of the Container dependency injection system.

## Examples Overview

### 1. Basic Usage (`basic-usage.ts`)
- Simple value storage and retrieval
- Factory functions
- Protected callables
- Key existence checks
- Container management operations

### 2. Dependency Injection (`dependency-injection.ts`)
- Manual dependency binding
- Auto-wiring with constructor injection
- Singleton behavior
- Circular dependency detection
- Dependency binding by name

### 3. Factories and Protection (`factories-and-protection.ts`)
- Factory functions (new instance each time)
- Protected callables (return function itself)
- Implicit factories (frozen after first use)
- Frozen key behavior
- Raw value access

### 4. Service Providers (`service-providers.ts`)
- Service provider pattern implementation
- Modular service registration
- Additional values with providers
- Real-world service organization

### . Advanced Patterns (`advanced-patterns.ts`)
- Complex dependency graphs
- Event-driven architecture
- Proxy access patterns
- Container composition
- Service lifecycle management

## Running Examples

```bash
# Run all examples
pnpm run examples

# Run a specific example
npx ts-node examples/[example-name].ts
```

## Key Concepts Demonstrated

1. **Dependency Injection**: Automatic resolution of class dependencies
2. **Service Lifecycle**: Singleton vs factory patterns
3. **Modularity**: Service providers for organized registration
4. **Flexibility**: Multiple ways to register and retrieve services
5. **Safety**: Frozen keys, protected callables, error handling
6. **Real-world Patterns**: Event systems, configuration management

## Best Practices

- Use service providers for modular service registration
- Leverage auto-wiring for clean dependency injection
- Use factories for services that need new instances each time
- Protect callables when you want to return the function itself
- Handle circular dependencies appropriately