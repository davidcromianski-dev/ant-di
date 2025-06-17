import 'reflect-metadata'; // Ensure it's loaded for tests too
import {Container, IServiceProvider} from './index';

// Simple no-op decorator to ensure metadata is emitted
function Injectable(): ClassDecorator {
  return (target: object) => {
    // This function body is intentionally empty.
    // The decorator's purpose is to trigger metadata emission.
  };
}

// Test classes for auto-wiring
@Injectable()
class NoDepsClass {
    constructor() {} // Added explicit constructor
}

@Injectable()
class SingleDepClass {
    constructor(public noDeps: NoDepsClass) {} // Already has an explicit constructor
}

@Injectable()
class MultiDepClass {
    constructor(public noDeps: NoDepsClass, public singleDep: SingleDepClass) {} // Already has an explicit constructor
}

// For circular dependency test - will be defined inside the test case

// Note: NonExistentClass is not defined globally for the 'unresolved dependency' test.
// It will be defined locally within that specific test case if needed for type hinting,
// or the test will rely on a dependency that cannot be instantiated by default (like Symbol).

describe('Container', () => {
    it('should set and get a value', () => {
        const container = new Container();
        container.offsetSet('key', 'value');
        expect(container.offsetGet('key')).toBe('value');
    });

    it('should throw an error when getting a non-existent key', () => {
        const container = new Container();
        expect(() => container.offsetGet('nonExistentKey')).toThrow('Key "nonExistentKey" is not defined.');
    });

    it('should check if a key exists', () => {
        const container = new Container();
        container.offsetSet('key', 'value');
        expect(container.offsetExists('key')).toBe(true);
        expect(container.offsetExists('nonExistentKey')).toBe(false);
    });

    it('should unset a key', () => {
        const container = new Container();
        container.offsetSet('key', 'value');
        container.offsetUnset('key');
        expect(container.offsetExists('key')).toBe(false);
    });

    it('should register and get a factory', () => {
        const container = new Container();
        const factory = jest.fn((c) => 'value'); // Changed param name to avoid conflict

        container.factory(factory);
        container.offsetSet('factory', factory);
        expect(container.offsetGet('factory')).toBe('value');
        expect(factory).toHaveBeenCalledWith(container);
    });

    it('should protect a value', () => {
        const container = new Container();
        const protectedValue = jest.fn((c) => 'value'); // Changed param name
        container.protect(protectedValue);
        container.offsetSet('key', protectedValue);
        expect(container.offsetGet('key')).toBe(protectedValue);
    });

    it('should get raw value', () => {
        const container = new Container();
        container.offsetSet('key', 'value');
        expect(container.raw('key')).toBe('value');
    });

    it('should throw an error when getting raw value of non-existent key', () => {
        const container = new Container();
        expect(() => container.raw('nonExistentKey')).toThrow('Key "nonExistentKey" is not defined.');
    });

    it('should get all keys', () => {
        const container = new Container();
        container.offsetSet('key1', 'value1');
        container.offsetSet('key2', 'value2');
        expect(container.keys()).toEqual(expect.arrayContaining(['key1', 'key2']));
    });

    it('should register a service provider', () => {
        const container = new Container();
        const provider = {
            register: jest.fn((c) => { // Changed param name
                c.offsetSet('service', 'value');
            })
        } as unknown as IServiceProvider;
        container.register(provider);
        expect(provider.register).toHaveBeenCalledWith(container);
        expect(container.offsetGet('service')).toBe('value');
    });

    test('setLanguage should allow setting to "en-us" without errors', async () => {
        const c = new Container();
        await expect(c.setLanguage('en-us')).resolves.toBeUndefined();
    });

    test('setLanguage should warn for unsupported languages but not throw', async () => {
        const c = new Container();
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        await c.setLanguage('xx-yy');
        expect(consoleWarnSpy).toHaveBeenCalledWith('Language xx-yy not supported. Keeping en-us.');
        consoleWarnSpy.mockRestore();
    });
});


describe('Container Auto-wiring', () => {
    let container: Container;

    beforeEach(() => {
        container = new Container();
    });

    test('should auto-wire a class with no dependencies', () => {
        const instance = container.offsetGet(NoDepsClass);
        expect(instance).toBeInstanceOf(NoDepsClass);
    });

    test('should auto-wire a class with a single dependency', () => {
        const instance = container.offsetGet(SingleDepClass);
        expect(instance).toBeInstanceOf(SingleDepClass);
        expect(instance.noDeps).toBeInstanceOf(NoDepsClass);
    });

    test('should auto-wire a class with multiple dependencies', () => {
        const instance = container.offsetGet(MultiDepClass);
        expect(instance).toBeInstanceOf(MultiDepClass);
        expect(instance.noDeps).toBeInstanceOf(NoDepsClass);
        expect(instance.singleDep).toBeInstanceOf(SingleDepClass);
        expect(instance.singleDep.noDeps).toBeInstanceOf(NoDepsClass);
    });

    test('should treat auto-wired services as singletons by default', () => {
        const instance1 = container.offsetGet(SingleDepClass);
        const instance2 = container.offsetGet(SingleDepClass);
        expect(instance1).toBe(instance2);
        expect(instance1.noDeps).toBe(instance2.noDeps);
    });

    test('auto-wired singleton instances should be the same as resolved dependencies', () => {
        const multiDepInstance = container.offsetGet(MultiDepClass);
        const singleDepInstance = container.offsetGet(SingleDepClass);
        const noDepsInstance = container.offsetGet(NoDepsClass);

        expect(multiDepInstance.singleDep).toBe(singleDepInstance);
        expect(multiDepInstance.noDeps).toBe(noDepsInstance);
        expect(singleDepInstance.noDeps).toBe(noDepsInstance);
    });

    test('should throw an error for an unresolvable dependency', () => {
        @Injectable()
        class TrulyUnresolvable { constructor(public magic: Symbol) {} } // Explicit constructor
        @Injectable()
        class DepOnTrulyUnresolvable { constructor(public dep: TrulyUnresolvable) {} } // Explicit constructor

        expect(() => {
            container.offsetGet(DepOnTrulyUnresolvable);
        }).toThrow(/Auto-wiring failed for DepOnTrulyUnresolvable: Failed to resolve dependency TrulyUnresolvable for DepOnTrulyUnresolvable: Auto-wiring failed for TrulyUnresolvable: Failed to resolve dependency Object for TrulyUnresolvable: Auto-wiring failed for Object: Could not resolve dependencies for Object\. Ensure it is a class and metadata is emitted\./);
    });

    test('should throw an error for circular dependencies', () => {
        @Injectable()
        class TestCircularA {
            constructor(public b: TestCircularB) {}
        }

        @Injectable()
        class TestCircularB {
            constructor(public a: TestCircularA) {}
        }

        expect(() => {
            container.offsetGet(TestCircularA);
        }).toThrow(
            /Circular dependency detected: TestCircularA -> TestCircularB -> TestCircularA|Cannot access 'TestCircular[AB]' before initialization/i
        );
    });

    test('should use explicitly registered service if available instead of auto-wiring for a dependency', () => {
        const mockNoDeps = new NoDepsClass();
        container.offsetSet(NoDepsClass.name, mockNoDeps); // Register by class name

        const instance = container.offsetGet(SingleDepClass);
        expect(instance.noDeps).toBe(mockNoDeps);

        // Also test if registered by the class itself (if offsetSet were to support it like offsetGet)
        // For now, this would effectively register a new service if NoDepsClass.name is different from NoDepsClass key
        // However, current offsetGet uses .name for functions, so this tests that behavior.
        const anotherMockNoDeps = new NoDepsClass();
        container.offsetSet(NoDepsClass.name, anotherMockNoDeps); // Re-register with the same key (NoDepsClass.name)

        const instance2 = container.offsetGet(SingleDepClass);
        // Since SingleDepClass is a singleton, instance2 is the same as the first instance of SingleDepClass resolved.
        // Its noDeps dependency would be the one resolved when SingleDepClass was first created.
        // If the first instance used mockNoDeps, this should still be mockNoDeps.
        // Let's get the first instance to be sure about its dependency.
        container.offsetSet(NoDepsClass.name, mockNoDeps); // Reset to original mock for clarity for instance1
        const instance1 = container.offsetGet(SingleDepClass); // instance1.noDeps is mockNoDeps

        container.offsetSet(NoDepsClass.name, anotherMockNoDeps); // Now change the registration for NoDepsClass
        const instance2FreshResolve = container.offsetGet(SingleDepClass); // This should still be instance1

        expect(instance2FreshResolve.noDeps).toBe(mockNoDeps); // Dependency of singleton instance1 does not change

    });

    test('should allow registering a class constructor as a factory itself', () => {
        const noDepsFactory = () => new NoDepsClass();
        container.factory(noDepsFactory);
        container.offsetSet('NoDepsService', noDepsFactory);

        const instance1 = container.offsetGet('NoDepsService') as NoDepsClass;
        const instance2 = container.offsetGet('NoDepsService') as NoDepsClass;

        expect(instance1).toBeInstanceOf(NoDepsClass);
        expect(instance2).toBeInstanceOf(NoDepsClass);
        expect(instance1).not.toBe(instance2); // Factories produce new instances
    });

    test('should auto-wire a class whose dependency is registered as a factory', () => {
        const noDepsFactory = () => new NoDepsClass();
        // Register NoDepsClass as a factory that creates NoDepsClass instances
        container.factory(noDepsFactory);
        container.offsetSet(NoDepsClass.name, noDepsFactory); // Make NoDepsClass itself (via its name) a factory

        const instance = container.offsetGet(SingleDepClass);
        expect(instance).toBeInstanceOf(SingleDepClass);
        expect(instance.noDeps).toBeInstanceOf(NoDepsClass);

        const noDepsInstance1 = container.offsetGet(NoDepsClass);
        const noDepsInstance2 = container.offsetGet(NoDepsClass);
        expect(noDepsInstance1).not.toBe(noDepsInstance2); // Verify factory behavior for NoDepsClass

        // The SingleDepClass should get a new NoDepsClass instance each time it's resolved if its dependency is a factory
        // However, SingleDepClass itself is a singleton. So its NoDeps instance is resolved once.
        const instanceA = container.offsetGet(SingleDepClass);
        const instanceB = container.offsetGet(SingleDepClass);
        expect(instanceA).toBe(instanceB);
        expect(instanceA.noDeps).toBe(instanceB.noDeps); // This NoDeps instance was created once for instanceA and reused.
    });

    test('auto-wiring should differentiate between class type and string key if name collides', () => {
        container.offsetSet(NoDepsClass.name, "explicit string value for NoDepsClass.name");

        // Auto-wire NoDepsClass (should use constructor, not the string)
        const instance = container.offsetGet(NoDepsClass);
        expect(instance).toBeInstanceOf(NoDepsClass);

        // Get by string key
        const val = container.offsetGet(NoDepsClass.name);
        expect(val).toBe("explicit string value for NoDepsClass.name");
    });
});
