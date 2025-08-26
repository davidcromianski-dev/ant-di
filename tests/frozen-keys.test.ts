import { describe, it, assert } from 'poku';
import { Container } from '../src';

describe('📦 Container - Frozen Keys', () => {
    it('should handle frozen keys', () => {
        const container = new Container();
        
        container.set('frozenKey', () => 'value');
        
        const result = container.get('frozenKey');
        assert.equal(result, 'value');
        
        const result2 = container.get('frozenKey');
        assert.equal(result, result2);
        
        assert.throws(() => container.set('frozenKey', 'newValue'), 'Key "frozenKey" is frozen.');
        
        assert.throws(() => container.set('frozenKey', () => 'anotherValue'), 'Key "frozenKey" is frozen.');
    });

    it('should unfreeze keys when unset', () => {
        const container = new Container();
        
        container.set('testKey', () => 'original');
        container.get('testKey');
        
        assert.throws(() => container.set('testKey', 'newValue'), 'Key "testKey" is frozen.');
        
        container.unset('testKey');
        
        container.set('testKey', 'newValue');
        assert.equal(container.get('testKey'), 'newValue');
    });

    it('should not freeze explicit factories', () => {
        const container = new Container();
        
        const factory = (c: any) => 'factoryValue';
        container.factory(factory);
        container.set('factoryKey', factory);
        
        const result = container.get('factoryKey');
        assert.equal(result, 'factoryValue');
        
        container.set('factoryKey', 'newValue');
        assert.equal(container.get('factoryKey'), 'newValue');
    });

    it('should not freeze protected callables', () => {
        const container = new Container();
        
        const protectedCallable = (c: any) => 'protectedValue';
        container.protect(protectedCallable);
        container.set('protectedKey', protectedCallable);
        
        const result = container.get('protectedKey');
        assert.equal(result, protectedCallable);
        
        container.set('protectedKey', 'newValue');
        assert.equal(container.get('protectedKey'), 'newValue');
    });

    it('should freeze only after first resolution of implicit factories', () => {
        const container = new Container();
        
        container.set('implicitKey', (c: any) => 'implicitValue');

        container.set('implicitKey', (c: any) => 'beforeAccess');
        assert.equal(container.get('implicitKey'), 'beforeAccess');
        
        assert.throws(() => container.set('implicitKey', 'afterAccess'), 'Key "implicitKey" is frozen.');
    });
});
