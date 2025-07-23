import { Container } from '../src';

/**
 * Basic usage examples showing fundamental container operations
 */
export function basicUsageExamples() {
    console.log('=== Basic Usage Examples ===\n');

    // Create a container
    const container = new Container();

    // 1. Simple value storage
    container.offsetSet('appName', 'My Application');
    container.offsetSet('version', '1.0.0');
    container.offsetSet('debug', true);

    console.log('Simple values:');
    console.log('App Name:', container.offsetGet('appName'));
    console.log('Version:', container.offsetGet('version'));
    console.log('Debug:', container.offsetGet('debug'));

    // 2. Factory functions
    const timestampFactory = (c: Container) => new Date().toISOString();
    container.factory(timestampFactory);
    container.offsetSet('timestamp', timestampFactory);

    console.log('\nFactory functions:');
    console.log('Timestamp 1:', container.offsetGet('timestamp'));
    console.log('Timestamp 2:', container.offsetGet('timestamp')); // Different each time

    // 3. Protected callables
    const configFunction = (c: Container) => ({ apiUrl: 'https://api.example.com' });
    container.protect(configFunction);
    container.offsetSet('config', configFunction);

    console.log('\nProtected callables:');
    console.log('Config function:', container.offsetGet('config')); // Returns the function itself

    // 4. Key existence checks
    console.log('\nKey existence:');
    console.log('appName exists:', container.offsetExists('appName'));
    console.log('nonexistent exists:', container.offsetExists('nonexistent'));

    // 5. Getting all keys
    console.log('\nAll registered keys:', container.keys());

    // 6. Unsetting keys
    container.offsetUnset('debug');
    console.log('\nAfter unsetting debug:');
    console.log('debug exists:', container.offsetExists('debug'));
} 