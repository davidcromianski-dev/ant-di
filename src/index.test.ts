import {Container, ServiceProviderInterface} from './index';

describe('Container', () => {
    it('should set and get a value', () => {
        const container = new Container();
        container.offsetSet('key', 'value');
        expect(container.offsetGet('key')).toBe('value');
    });

    it('should throw an error when getting a non-existent key', () => {
        const container = new Container();
        expect(() => container.offsetGet('nonExistentKey')).toThrow('Key "nonExistentKey" is not defined.');
    });

    it('should check if a key exists', () => {
        const container = new Container();
        container.offsetSet('key', 'value');
        expect(container.offsetExists('key')).toBe(true);
        expect(container.offsetExists('nonExistentKey')).toBe(false);
    });

    it('should unset a key', () => {
        const container = new Container();
        container.offsetSet('key', 'value');
        container.offsetUnset('key');
        expect(container.offsetExists('key')).toBe(false);
    });

    it('should register and get a factory', () => {
        const container = new Container();
        const factory = jest.fn((container) => 'value');

        container.factory(factory);
        container.offsetSet('factory', factory);
        expect(container.offsetGet('factory')).toBe('value');
        expect(factory).toHaveBeenCalledWith(container);
    });

    it('should protect a value', () => {
        const container = new Container();
        const protectedValue = jest.fn((container) => 'value');
        container.protect(protectedValue);
        container.offsetSet('key', protectedValue);
        expect(container.offsetGet('key')).toBe(protectedValue);
    });

    it('should get raw value', () => {
        const container = new Container();
        container.offsetSet('key', 'value');
        expect(container.raw('key')).toBe('value');
    });

    it('should throw an error when getting raw value of non-existent key', () => {
        const container = new Container();
        expect(() => container.raw('nonExistentKey')).toThrow('Key "nonExistentKey" is not defined.');
    });

    it('should get all keys', () => {
        const container = new Container();
        container.offsetSet('key1', 'value1');
        container.offsetSet('key2', 'value2');
        expect(container.keys()).toEqual(['key1', 'key2']);
    });

    it('should register a service provider', () => {
        const container = new Container();
        const provider = {
            register: jest.fn((container) => {
                container.offsetSet('service', 'value');
            })
        } as unknown as ServiceProviderInterface;
        container.register(provider);
        expect(provider.register).toHaveBeenCalledWith(container);
        expect(container.offsetGet('service')).toBe('value');
    });
});
