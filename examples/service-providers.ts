import { Container, IServiceProvider } from '../src';

/**
 * Examples demonstrating service provider pattern
 */

// Service provider for database services
class DatabaseServiceProvider implements IServiceProvider {
    register(container: Container): void {
        container.set('db.host', 'localhost');
        container.set('db.port', 5432);
        container.set('db.name', 'myapp');
        
        const connectionFactory = (c: Container) => ({
            host: c.get('db.host'),
            port: c.get('db.port'),
            database: c.get('db.name'),
            connect: () => `Connected to ${c.get('db.host')}:${c.get('db.port')}/${c.get('db.name')}`
        });
        
        container.factory(connectionFactory);
        container.set('db.connection', connectionFactory);
    }
}

// Service provider for cache services
class CacheServiceProvider implements IServiceProvider {
    register(container: Container): void {
        container.set('cache.driver', 'redis');
        container.set('cache.ttl', 3600);
        
        const cacheFactory = (c: Container) => ({
            driver: c.get('cache.driver'),
            ttl: c.get('cache.ttl'),
            get: (key: string) => `Getting ${key} from ${c.get('cache.driver')}`,
            set: (key: string, value: any) => `Setting ${key} = ${value} in ${c.get('cache.driver')}`
        });
        
        container.set('cache', cacheFactory);
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
    console.log('Host:', container.get('db.host'));
    console.log('Port:', container.get('db.port'));
    
    const dbConnection = container.get('db.connection') as any;
    console.log('Connection:', dbConnection.connect());

    console.log('\nCache services:');
    const cache = container.get('cache') as any;
    console.log('Cache get:', cache.get('user:123'));
    console.log('Cache set:', cache.set('user:123', { name: 'John' }));

    // 3. Register provider with additional values
    const additionalValues = {
        'app.environment': 'production',
        'app.debug': false
    };

    container.register(new DatabaseServiceProvider(), additionalValues);
    console.log('\nAdditional values:');
    console.log('Environment:', container.get('app.environment'));
    console.log('Debug:', container.get('app.debug'));
} 

serviceProviderExamples();