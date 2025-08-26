import { describe, it, assert } from 'poku';
import { Container } from '../src';

describe('📦 Container - Factory Operations', () => {
    it('should register and get a factory using factory() method', () => {
        const container = new Container();
        const factory = (c: Container) => 'value';

        container.factory(factory);
        container.set('factory', factory);
        assert.equal(container.get('factory'), 'value');
    });

    it('should register and get a factory using set method', () => {
        const container = new Container();
        const factory = (c: Container) => 'value';

        container.factory(factory);
        container.set('factory', factory);
        assert.equal(container.get('factory'), 'value');
    });

    it('should register and get a factory directly using offsetSet with factory=true', () => {
        const container = new Container();
        const factory = (c: Container) => 'value';

        // Legacy way: register factory directly with offsetSet
        container.offsetSet('factory', factory, true);
        assert.equal(container.get('factory'), 'value');
    });

    it('should register and get a factory directly using set with factory=true', () => {
        const container = new Container();
        const factory = (c: Container) => 'value';

        // Recommended way: register factory directly with set
        container.set('factory', factory, true);
        assert.equal(container.get('factory'), 'value');
    });

    it('should register and get a factory using both methods (they should be equivalent)', () => {
        const container = new Container();
        const factory = (c: Container) => 'value';

        // Method 1: using factory() method
        container.factory(factory);
        container.offsetSet('factory1', factory);
        
        // Method 2: using offsetSet with factory=true
        container.offsetSet('factory2', factory, true);

        // Method 3: using new set method
        container.set('factory3', factory, true);

        // All should work the same way
        assert.equal(container.get('factory1'), 'value');
        assert.equal(container.get('factory2'), 'value');
        assert.equal(container.get('factory3'), 'value');
        
        // All should be marked as factories
        assert.equal(container.raw('factory1'), factory);
        assert.equal(container.raw('factory2'), factory);
        assert.equal(container.raw('factory3'), factory);
    });

    it('should protect a value', () => {
        const container = new Container();
        const protectedValue = (c: Container) => 'value';
        container.protect(protectedValue);
        container.set('key', protectedValue);
        assert.equal(container.get('key'), protectedValue);
    });

    it('should get raw value', () => {
        const container = new Container();
        container.set('key', 'value');
        assert.equal(container.raw('key'), 'value');
    });

    it('should throw an error when getting raw value of non-existent key', () => {
        const container = new Container();
        assert.throws(() => container.raw('nonExistentKey'), 'Key "nonExistentKey" is not defined.');
    });

    it('should handle factory registration with different factory parameter values', () => {
        const container = new Container();
        const factory = (c: Container) => 'factoryValue';
        const regularValue = 'regularValue';

        // Register as regular value (factory=false, default)
        container.set('regular', regularValue, false);
        assert.equal(container.get('regular'), 'regularValue');

        // Register as factory (factory=true)
        container.set('factory', factory, true);
        assert.equal(container.get('factory'), 'factoryValue');

        // Register as regular value (factory=false, explicit)
        container.set('explicitRegular', regularValue, false);
        assert.equal(container.get('explicitRegular'), 'regularValue');
    });
});
