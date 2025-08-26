import { describe, it, assert } from 'poku';
import { Container } from '../src';

describe('📦 Container - Basic Operations', () => {
    it('should set and get a value', () => {
        const container = new Container();
        container.set('key', 'value');
        const value = container.get('key');
        assert.equal(value, 'value');
    });

    it('should set and get a value using set method', () => {
        const container = new Container();
        container.set('key', 'value');
        const value = container.get('key');
        assert.equal(value, 'value');
    });

    it('should throw an error when getting a non-existent key', () => {
        const container = new Container();
        assert.throws(() => container.get('nonExistentKey'), 'Key "nonExistentKey" is not defined.');
    });

    it('should check if a key exists', () => {
        const container = new Container();
        container.set('key', 'value');
        assert.equal(container.has('key'), true);
        assert.equal(container.has('nonExistentKey'), false);
    });

    it('should unset a key', () => {
        const container = new Container();
        container.set('key', 'value');
        container.unset('key');
        assert.equal(container.has('key'), false);
    });

    it('should get all keys', () => {
        const container = new Container();
        container.set('key1', 'value1');
        container.set('key2', 'value2');
        const keys = container.keys();
        assert.equal(keys.includes('key1'), true);
        assert.equal(keys.includes('key2'), true);
    });

    it('should clear all registered services', () => {
        const container = new Container();
        container.set('key1', 'value1');
        container.set('key2', 'value2');
        assert.equal(container.has('key1'), true);
        assert.equal(container.has('key2'), true);
        
        container.clear();
        assert.equal(container.has('key1'), false);
        assert.equal(container.has('key2'), false);
        assert.equal(container.keys().length, 0);
    });

    it('should dispose of the container', () => {
        const container = new Container();
        container.set('key', 'value');
        assert.equal(container.has('key'), true);
        
        container.dispose();
        assert.equal(container.has('key'), false);
        assert.equal(container.keys().length, 0);
    });
});
