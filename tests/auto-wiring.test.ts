import { assert, describe, it } from 'poku';
import { Container } from '../src';

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

describe('📦 Container - Auto-wiring', () => {
    it('should handle auto-wiring with no dependencies using manual binding', () => {
        const container = new Container();
        container.bind(NoDepsClass, []);
        const instance = container.get(NoDepsClass);
        assert.equal(instance instanceof NoDepsClass, true);
        const instance2 = container.get('NoDepsClass');
        assert.equal(instance, instance2);
    });

    it('should handle auto-wiring with single dependency using manual binding', () => {
        const container = new Container();
        container.bind(NoDepsClass, []);
        container.bind(SingleDepClass, [NoDepsClass]);
        const instance = container.get(SingleDepClass);
        assert.equal(instance instanceof SingleDepClass, true);
        assert.equal(instance.noDeps instanceof NoDepsClass, true);
    });

    it('should handle auto-wiring with multiple dependencies using manual binding', () => {
        const container = new Container();
        container.bind(NoDepsClass, []);
        container.bind(SingleDepClass, [NoDepsClass]);
        container.bind(MultiDepClass, [NoDepsClass, SingleDepClass]);
        const instance = container.get(MultiDepClass);
        assert.equal(instance instanceof MultiDepClass, true);
        assert.equal(instance.noDeps instanceof NoDepsClass, true);
        assert.equal(instance.singleDep instanceof SingleDepClass, true);
    });

    it('should cache singleton instances', () => {
        const container = new Container();
        container.bind(NoDepsClass, []);
        const instance1 = container.get(NoDepsClass);
        const instance2 = container.get(NoDepsClass);
        assert.equal(instance1, instance2);
    });

    it('should handle circular dependency detection during binding', () => {
        class TestCircularA {
            constructor(public b: TestCircularB) { }
        }

        class TestCircularB {
            constructor(public a: TestCircularA) { }
        }

        const container = new Container();
        
        // First binding should work
        container.bind(TestCircularA, [TestCircularB]);
        
        // Second binding should throw circular dependency error
        assert.throws(() => {
            container.bind(TestCircularB, [TestCircularA]);
        }, /circular dependency/i);
    });

    it('should handle invalid dependencies during binding', () => {
        class UnresolvableClass {
            constructor(public nonExistent: any) { }
        }

        const container = new Container();
        
        // Should throw error when trying to bind with non-function dependency
        assert.throws(() => {
            container.bind(UnresolvableClass, [Symbol('NonExistent') as any]);
        }, /Callable is not a Closure or invokable object/i);
    });

    it('should handle binding with valid dependencies', () => {
        const container = new Container();
        
        // Should work with valid constructor functions
        container.bind(NoDepsClass, []);
        const instance = container.get(NoDepsClass);
        assert.equal(instance instanceof NoDepsClass, true);
    });

    it('should handle self-referential circular dependency', () => {
        class SelfReferentialClass {
            constructor(public self: SelfReferentialClass) { }
        }

        const container = new Container();
        
        // Should throw error for self-referential dependency
        assert.throws(() => {
            container.bind(SelfReferentialClass, [SelfReferentialClass]);
        }, /circular dependency/i);
    });
});
