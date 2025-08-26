import { describe, it, assert } from 'poku';
import { Container } from '../src';

describe('📦 Container - Constructor Initialization', () => {
    it('should handle constructor initialization', () => {
        const initialValues = {
            'key1': 'value1',
            'key2': 'value2'
        };

        const container = new Container(initialValues);
        assert.equal(container.get('key1'), 'value1');
        assert.equal(container.get('key2'), 'value2');
    });
});
