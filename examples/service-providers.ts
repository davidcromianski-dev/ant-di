import { Container, IServiceProvider } from '../src';

/**
 * Examples demonstrating service provider pattern
 */

// Service provider for database services
class DatabaseServiceProvider implements IServiceProvider {
    register(container: Container): void {
        container.offsetSet('db.host', 'localhost');
        container.offsetSet('db.port', 5432);
        container.offsetSet('db.name', 'myapp');
        
        const connectionFactory = (c: Container) => ({
            host: c.offsetGet('db.host'),
            port: c.offsetGet('db.port'),
            database: c.offsetGet('db.name'),
            connect: () => `Connected to ${c.offsetGet('db.host')}:${c.offsetGet('db.port')}/${c.offsetGet('db.name')}`
        });
        
        container.factory(connectionFactory);
        container.offsetSet('db.connection', connectionFactory);
    }
}

// Service provider for cache services
class CacheServiceProvider implements IServiceProvider {
    register(container: Container): void {
        container.offsetSet('cache.driver', 'redis');
        container.offsetSet('cache.ttl', 3600);
        
        const cacheFactory = (c: Container) => ({
            driver: c.offsetGet('cache.driver'),
            ttl: c.offsetGet('cache.ttl'),
            get: (key: string) => `Getting ${key} from ${c.offsetGet('cache.driver')}`,
            set: (key: string, value: any) => `Setting ${key} = ${value} in ${c.offsetGet('cache.driver')}`
        });
        
        container.offsetSet('cache', cacheFactory);
    }
}

function serviceProviderExamples() {
    console.log('=== Service Provider Examples ===\n');

    const container = new Container();

    // 1. Register service providers
    container.register(new DatabaseServiceProvider());
    container.register(new CacheServiceProvider());

    // 2. Access services from providers
    console.log('Database services:');
    console.log('Host:', container.offsetGet('db.host'));
    console.log('Port:', container.offsetGet('db.port'));
    
    const dbConnection = container.offsetGet('db.connection') as any;
    console.log('Connection:', dbConnection.connect());

    console.log('\nCache services:');
    const cache = container.offsetGet('cache') as any;
    console.log('Cache get:', cache.get('user:123'));
    console.log('Cache set:', cache.set('user:123', { name: 'John' }));

    // 3. Register provider with additional values
    const additionalValues = {
        'app.environment': 'production',
        'app.debug': false
    };

    container.register(new DatabaseServiceProvider(), additionalValues);
    console.log('\nAdditional values:');
    console.log('Environment:', container.offsetGet('app.environment'));
    console.log('Debug:', container.offsetGet('app.debug'));
} 

serviceProviderExamples();