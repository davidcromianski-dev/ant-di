import 'reflect-metadata';
import { describe, it, assert } from 'poku';
import { Container, IServiceProvider } from '../src/index';

// Test classes for auto-wiring (without decorators)
class NoDepsClass {
    constructor() { }
}

class SingleDepClass {
    constructor(public noDeps: NoDepsClass) { }
}

class MultiDepClass {
    constructor(public noDeps: NoDepsClass, public singleDep: SingleDepClass) { }
}

describe('📦 Container', () => {
    describe('Basic Operations', () => {
        it('should set and get a value', () => {
            const container = new Container();
            container.offsetSet('key', 'value');
            const value = container.offsetGet('key');
            assert.equal(value, 'value');
        });

        it('should throw an error when getting a non-existent key', () => {
            const container = new Container();
            assert.throws(() => container.offsetGet('nonExistentKey'), 'Key "nonExistentKey" is not defined.');
        });

        it('should check if a key exists', () => {
            const container = new Container();
            container.offsetSet('key', 'value');
            assert.equal(container.offsetExists('key'), true);
            assert.equal(container.offsetExists('nonExistentKey'), false);
        });

        it('should unset a key', () => {
            const container = new Container();
            container.offsetSet('key', 'value');
            container.offsetUnset('key');
            assert.equal(container.offsetExists('key'), false);
        });

        it('should get all keys', () => {
            const container = new Container();
            container.offsetSet('key1', 'value1');
            container.offsetSet('key2', 'value2');
            const keys = container.keys();
            assert.equal(keys.includes('key1'), true);
            assert.equal(keys.includes('key2'), true);
        });
    });

    describe('Factory Operations', () => {
        it('should register and get a factory', () => {
            const container = new Container();
            const factory = (c: Container) => 'value';

            container.factory(factory);
            container.offsetSet('factory', factory);
            assert.equal(container.offsetGet('factory'), 'value');
        });

        it('should protect a value', () => {
            const container = new Container();
            const protectedValue = (c: Container) => 'value';
            container.protect(protectedValue);
            container.offsetSet('key', protectedValue);
            assert.equal(container.offsetGet('key'), protectedValue);
        });

        it('should get raw value', () => {
            const container = new Container();
            container.offsetSet('key', 'value');
            assert.equal(container.raw('key'), 'value');
        });

        it('should throw an error when getting raw value of non-existent key', () => {
            const container = new Container();
            assert.throws(() => container.raw('nonExistentKey'), 'Key "nonExistentKey" is not defined.');
        });
    });

    describe('Auto-wiring', () => {
        it('should handle auto-wiring with no dependencies using manual registration', () => {
            const container = new Container();
            container.registerDependencies(NoDepsClass, []);
            const instance = container.offsetGet(NoDepsClass);
            assert.equal(instance instanceof NoDepsClass, true);
        });

        it('should handle auto-wiring with single dependency using manual registration', () => {
            const container = new Container();
            container.registerDependencies(NoDepsClass, []);
            container.registerDependencies(SingleDepClass, [NoDepsClass]);
            const instance = container.offsetGet(SingleDepClass);
            assert.equal(instance instanceof SingleDepClass, true);
            assert.equal(instance.noDeps instanceof NoDepsClass, true);
        });

        it('should handle auto-wiring with multiple dependencies using manual registration', () => {
            const container = new Container();
            container.registerDependencies(NoDepsClass, []);
            container.registerDependencies(SingleDepClass, [NoDepsClass]);
            container.registerDependencies(MultiDepClass, [NoDepsClass, SingleDepClass]);
            const instance = container.offsetGet(MultiDepClass);
            assert.equal(instance instanceof MultiDepClass, true);
            assert.equal(instance.noDeps instanceof NoDepsClass, true);
            assert.equal(instance.singleDep instanceof SingleDepClass, true);
        });

        it('should cache singleton instances', () => {
            const container = new Container();
            container.registerDependencies(NoDepsClass, []);
            const instance1 = container.offsetGet(NoDepsClass);
            const instance2 = container.offsetGet(NoDepsClass);
            assert.equal(instance1, instance2);
        });

        it('should handle circular dependency detection with manual registration', () => {
            class TestCircularA {
                constructor(public b: TestCircularB) { }
            }

            class TestCircularB {
                constructor(public a: TestCircularA) { }
            }

            const container = new Container();
            container.registerDependencies(TestCircularA, [TestCircularB]);
            container.registerDependencies(TestCircularB, [TestCircularA]);
            assert.throws(() => container.offsetGet(TestCircularA), /circular dependency/i);
        });

        it('should handle unresolved dependencies with manual registration', () => {
            class UnresolvableClass {
                constructor(public nonExistent: any) { }
            }

            const container = new Container();
            container.registerDependencies(UnresolvableClass, [Symbol('NonExistent')]);
            assert.throws(() => container.offsetGet(UnresolvableClass), /failed to resolve dependency/i);
        });

        it('should handle manual dependency registration by name', () => {
            const container = new Container();
            container.registerDependenciesByName('NoDepsClass', []);
            const instance = container.offsetGet(NoDepsClass);
            assert.equal(instance instanceof NoDepsClass, true);
        });
    });

    describe('Frozen Keys', () => {
        it('should handle frozen keys', () => {
            const container = new Container();
            
            container.offsetSet('frozenKey', () => 'value');
            
            const result = container.offsetGet('frozenKey');
            assert.equal(result, 'value');
            
            const result2 = container.offsetGet('frozenKey');
            assert.equal(result, result2);
            
            assert.throws(() => container.offsetSet('frozenKey', 'newValue'), 'Key "frozenKey" is frozen.');
            
            assert.throws(() => container.offsetSet('frozenKey', () => 'anotherValue'), 'Key "frozenKey" is frozen.');
        });

        it('should unfreeze keys when unset', () => {
            const container = new Container();
            
            container.offsetSet('testKey', () => 'original');
            container.offsetGet('testKey');
            
            assert.throws(() => container.offsetSet('testKey', 'newValue'), 'Key "testKey" is frozen.');
            
            container.offsetUnset('testKey');
            
            container.offsetSet('testKey', 'newValue');
            assert.equal(container.offsetGet('testKey'), 'newValue');
        });

        it('should not freeze explicit factories', () => {
            const container = new Container();
            
            const factory = (c: any) => 'factoryValue';
            container.factory(factory);
            container.offsetSet('factoryKey', factory);
            
            const result = container.offsetGet('factoryKey');
            assert.equal(result, 'factoryValue');
            
            container.offsetSet('factoryKey', 'newValue');
            assert.equal(container.offsetGet('factoryKey'), 'newValue');
        });

        it('should not freeze protected callables', () => {
            const container = new Container();
            
            const protectedCallable = (c: any) => 'protectedValue';
            container.protect(protectedCallable);
            container.offsetSet('protectedKey', protectedCallable);
            
            const result = container.offsetGet('protectedKey');
            assert.equal(result, protectedCallable);
            
            container.offsetSet('protectedKey', 'newValue');
            assert.equal(container.offsetGet('protectedKey'), 'newValue');
        });

        it('should freeze only after first resolution of implicit factories', () => {
            const container = new Container();
            
            container.offsetSet('implicitKey', (c: any) => 'implicitValue');

            container.offsetSet('implicitKey', (c: any) => 'beforeAccess');
            assert.equal(container.offsetGet('implicitKey'), 'beforeAccess');
            
            assert.throws(() => container.offsetSet('implicitKey', 'afterAccess'), 'Key "implicitKey" is frozen.');
        });
    });

    describe('Proxy Access', () => {
        it('should handle proxy access', () => {
            const container = new Container();
            container.offsetSet('testKey', 'testValue');

            // Test proxy getter
            // @ts-ignore
            assert.equal(container.testKey, 'testValue');

            // Test proxy setter
            // @ts-ignore
            container.newKey = 'newValue';
            assert.equal(container.offsetGet('newKey'), 'newValue');
        });
    });

    describe('Constructor Initialization', () => {
        it('should handle constructor initialization', () => {
            const initialValues = {
                'key1': 'value1',
                'key2': 'value2'
            };

            const container = new Container(initialValues);
            assert.equal(container.offsetGet('key1'), 'value1');
            assert.equal(container.offsetGet('key2'), 'value2');
        });
    });

    describe('Service Providers', () => {
        it('should register a service provider', () => {
            const container = new Container();
            const provider: IServiceProvider = {
                register: (c: any) => {
                    c.offsetSet('service', 'value');
                }
            };

            container.register(provider);
            assert.equal(container.offsetGet('service'), 'value');
        });
    });

    describe('Internationalization', () => {
        it('should handle language setting', async () => {
            const container = new Container();
            await container.setLanguage('en-us');
            assert.equal(container.getLanguage(), 'en-us');
        });

        it('should handle unsupported language', async () => {
            const container = new Container();

            // Store original console.warn
            const originalWarn = console.warn;
            const warnCalls: string[] = [];

            // Mock console.warn
            console.warn = (message: string) => {
                warnCalls.push(message);
            };

            await container.setLanguage('unsupported-lang' as keyof typeof Container.langs);

            assert.equal(warnCalls.includes(`Language 'unsupported-lang' not supported. Keeping 'en-us'.`), true);

            // Restore original console.warn
            console.warn = originalWarn;
        });
    });
});