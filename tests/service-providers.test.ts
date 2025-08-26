import { describe, it, assert } from 'poku';
import { Container, IServiceProvider } from '../src';

describe('📦 Container - Service Providers', () => {
    it('should register a service provider', () => {
        const container = new Container();
        const provider: IServiceProvider = {
            register: (c: any) => {
                c.set('service', 'value');
            }
        };

        container.register(provider);
        assert.equal(container.get('service'), 'value');
    });
});
