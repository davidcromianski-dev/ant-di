# Test Structure

This directory contains the test files for the Container class, organized into logical modules for better maintainability.

## Test Files

### Main Test File
- **`container.test.ts`** - Main test file that imports all test modules

### Individual Test Modules
- **`basic-operations.test.ts`** - Tests for basic container operations (set, get, exists, unset, keys)
- **`factory-operations.test.ts`** - Tests for factory registration (both traditional and direct methods), protection, and raw value access
- **`auto-wiring.test.ts`** - Tests for dependency injection and auto-wiring functionality using the unified `bind` method
- **`frozen-keys.test.ts`** - Tests for key freezing behavior and protection
- **`proxy-access.test.ts`** - Tests for proxy-based property access
- **`constructor-init.test.ts`** - Tests for container initialization with initial values
- **`service-providers.test.ts`** - Tests for service provider registration

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Individual Test Files
```bash
npx poku tests/basic-operations.test.ts
npx poku tests/auto-wiring.test.ts
# etc.
```

## Benefits of This Structure

1. **Maintainability** - Each test file focuses on a specific aspect of functionality
2. **Readability** - Easier to find and understand specific test cases
3. **Modularity** - Tests can be run individually or as a group
4. **Organization** - Clear separation of concerns makes debugging easier
5. **Scalability** - Easy to add new test modules without cluttering existing ones

## Adding New Tests

When adding new functionality to the Container class:

1. Create a new test file following the naming convention: `feature-name.test.ts`
2. Import the new test file in `container.test.ts`
3. Follow the existing test structure and naming conventions
4. Ensure all tests pass before committing

## Test Naming Conventions

- Test files: `kebab-case.test.ts`
- Test suites: `📦 Container - Feature Name`
- Test cases: Descriptive sentences explaining what is being tested
- Use the `describe` block for grouping related tests
- Use the `it` block for individual test cases
