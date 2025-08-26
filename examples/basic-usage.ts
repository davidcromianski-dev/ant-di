import { Container } from '../src';

/**
 * Basic usage examples showing fundamental container operations
 */
function basicUsageExamples() {
    console.log('=== Basic Usage Examples ===\n');

    // Create a container
    const container = new Container();

    // 1. Simple value storage
    container.set('appName', 'My Application');
    container.set('version', '1.0.0');
    container.set('debug', true);

    console.log('Simple values:');
    console.log('App Name:', container.get('appName'));
    console.log('Version:', container.get('version'));
    console.log('Debug:', container.get('debug'));

    // 2. Factory functions
    const timestampFactory = (c: Container) => new Date().toISOString();
    container.factory(timestampFactory);
    container.set('timestamp', timestampFactory);

    console.log('\nFactory functions:');
    console.log('Timestamp 1:', container.get('timestamp'));
    console.log('Timestamp 2:', container.get('timestamp')); // Different each time

    // 3. Protected callables
    const configFunction = (c: Container) => ({ apiUrl: 'https://api.example.com' });
    container.protect(configFunction);
    container.set('config', configFunction);

    console.log('\nProtected callables:');
    console.log('Config function:', container.get('config')); // Returns the function itself

    // 4. Key existence checks
    console.log('\nKey existence:');
    console.log('appName exists:', container.has('appName'));
    console.log('nonexistent exists:', container.has('nonexistent'));

    // 5. Getting all keys
    console.log('\nAll registered keys:', container.keys());

    // 6. Unsetting keys
    container.unset('debug');
    console.log('\nAfter unsetting debug:');
    console.log('debug exists:', container.has('debug'));
} 

basicUsageExamples();