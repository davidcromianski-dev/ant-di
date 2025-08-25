import { describe, it, assert } from 'poku';
import { Container } from '../src';

describe('📦 Container - Basic Operations', () => {
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
