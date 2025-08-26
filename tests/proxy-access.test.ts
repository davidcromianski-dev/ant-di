import { describe, it, assert } from 'poku';
import { Container } from '../src';

describe('📦 Container - Proxy Access', () => {
    it('should handle proxy access', () => {
        const container = new Container();
        container.set('testKey', 'testValue');

        // Test proxy getter
        // @ts-ignore
        assert.equal(container.testKey, 'testValue');

        // Test proxy setter
        // @ts-ignore
        container.newKey = 'newValue';
        assert.equal(container.get('newKey'), 'newValue');
    });
});
