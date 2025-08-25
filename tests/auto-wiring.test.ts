import { describe, it, assert } from 'poku';
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
        const instance = container.offsetGet(NoDepsClass);
        assert.equal(instance instanceof NoDepsClass, true);
    });

    it('should handle auto-wiring with single dependency using manual binding', () => {
        const container = new Container();
        container.bind(NoDepsClass, []);
        container.bind(SingleDepClass, [NoDepsClass]);
        const instance = container.offsetGet(SingleDepClass);
        assert.equal(instance instanceof SingleDepClass, true);
        assert.equal(instance.noDeps instanceof NoDepsClass, true);
    });

    it('should handle auto-wiring with multiple dependencies using manual binding', () => {
        const container = new Container();
        container.bind(NoDepsClass, []);
        container.bind(SingleDepClass, [NoDepsClass]);
        container.bind(MultiDepClass, [NoDepsClass, SingleDepClass]);
        const instance = container.offsetGet(MultiDepClass);
        assert.equal(instance instanceof MultiDepClass, true);
        assert.equal(instance.noDeps instanceof NoDepsClass, true);
        assert.equal(instance.singleDep instanceof SingleDepClass, true);
    });

    it('should cache singleton instances', () => {
        const container = new Container();
        container.bind(NoDepsClass, []);
        const instance1 = container.offsetGet(NoDepsClass);
        const instance2 = container.offsetGet(NoDepsClass);
        assert.equal(instance1, instance2);
    });

    it('should handle circular dependency detection with manual binding', () => {
        class TestCircularA {
            constructor(public b: TestCircularB) { }
        }

        class TestCircularB {
            constructor(public a: TestCircularA) { }
        }

        const container = new Container();
        container.bind(TestCircularA, [TestCircularB]);
        container.bind(TestCircularB, [TestCircularA]);
        assert.throws(() => container.offsetGet(TestCircularA), /circular dependency/i);
    });

    it('should handle unresolved dependencies with manual binding', () => {
        class UnresolvableClass {
            constructor(public nonExistent: any) { }
        }

        const container = new Container();
        container.bind(UnresolvableClass, [Symbol('NonExistent')]);
        assert.throws(() => container.offsetGet(UnresolvableClass), /failed to resolve dependency/i);
    });

    it('should handle manual dependency binding by class name', () => {
        const container = new Container();
        container.bind('NoDepsClass', []);
        const instance = container.offsetGet(NoDepsClass);
        assert.equal(instance instanceof NoDepsClass, true);
    });

    it('should handle manual dependency binding by constructor function', () => {
        const container = new Container();
        container.bind(NoDepsClass, []);
        const instance = container.offsetGet(NoDepsClass);
        assert.equal(instance instanceof NoDepsClass, true);
    });
});
