import { Container } from '../src/index';

/**
 * Advanced usage patterns and real-world scenarios
 */

// Event system
class EventEmitter {
    private listeners: Map<string, Function[]> = new Map();

    on(event: string, listener: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(listener);
    }

    emit(event: string, data: any) {
        const eventListeners = this.listeners.get(event) || [];
        eventListeners.forEach(listener => listener(data));
    }
}

// Application context
class ApplicationContext {
    constructor(
        private eventEmitter: EventEmitter,
        private config: any,
        private logger: any
    ) {}

    start() {
        this.logger.log('Application starting...');
        this.eventEmitter.emit('app.start', this.config);
        return 'Application started successfully';
    }
}

export function advancedPatternsExamples() {
    console.log('=== Advanced Patterns Examples ===\n');

    const container = new Container();

    // 1. Complex dependency graph
    container.registerDependencies(EventEmitter, []);
    container.registerDependencies(ApplicationContext, [EventEmitter, Object, Object]);

    // Register configuration
    container.offsetSet('config', {
        name: 'My App',
        version: '2.0.0',
        environment: 'development'
    });

    // Register logger
    const loggerFactory = (c: Container) => ({
        log: (message: string) => console.log(`[${new Date().toISOString()}] ${message}`),
        error: (message: string) => console.error(`[ERROR] ${message}`),
        warn: (message: string) => console.warn(`[WARN] ${message}`)
    });
    container.offsetSet('logger', loggerFactory);

    // 2. Event-driven architecture
    const appContext = container.offsetGet(ApplicationContext);
    
    // Set up event listeners
    const eventEmitter = container.offsetGet(EventEmitter);
    eventEmitter.on('app.start', (config: any) => {
        console.log(`Event: App starting with config:`, config);
    });

    console.log('Starting application:');
    const result = appContext.start();

    // 3. Proxy access pattern
    console.log('\nProxy access:');
    // @ts-ignore
    container.proxyValue = 'Accessed via proxy';
    // @ts-ignore
    console.log('Proxy value:', container.proxyValue);

    // 4. Container composition
    const childContainer = new Container({
        'child.service': 'Child service value'
    });

    console.log('\nChild container:');
    console.log('Child service:', childContainer.offsetGet('child.service'));

    // 5. Service lifecycle management
    const lifecycleService = (c: Container) => {
        const instance = {
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            destroy: () => console.log(`Destroying service ${instance.id}`)
        };
        console.log(`Creating service ${instance.id}`);
        return instance;
    };

    container.factory(lifecycleService);
    container.offsetSet('lifecycle', lifecycleService);

    console.log('\nService lifecycle:');
    const service1 = container.offsetGet('lifecycle');
    const service2 = container.offsetGet('lifecycle');
    console.log('Service 1 ID:', service1.id);
    console.log('Service 2 ID:', service2.id);
    console.log('Different instances:', service1.id !== service2.id);
} 