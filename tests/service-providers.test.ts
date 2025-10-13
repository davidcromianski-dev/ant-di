import { assert, describe, it } from 'poku';
import { Container, ServiceProviderInterface } from '../src';

describe('📦 Container - Service Providers', () => {
  it('should register a service provider', () => {
    const container = new Container();
    const provider: ServiceProviderInterface = {
      register: (c: any) => {
        c.set('service', 'value');
        return provider;
      },
    };

    container.register(provider);
    assert.equal(container.get('service'), 'value');
  });
});
