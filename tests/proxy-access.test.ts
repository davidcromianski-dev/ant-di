import { assert, describe, it } from 'poku';
import { Container } from '../src';

describe('📦 Container - Proxy Access', () => {
  it('should handle proxy access', () => {
    const container = new Container();
    container.set('testKey', 'testValue');

    // Test proxy getter
    // @ts-expect-error - Testing dynamic property access via proxy
    assert.equal(container.testKey, 'testValue');

    // Test proxy setter
    // @ts-expect-error - Testing dynamic property assignment via proxy
    container.newKey = 'newValue';
    assert.equal(container.get('newKey'), 'newValue');
  });
});
