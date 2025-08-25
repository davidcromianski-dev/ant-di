import { describe, it, assert } from 'poku';
import { Container } from '../src';

describe('📦 Container - Frozen Keys', () => {
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
