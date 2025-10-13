import { Container } from '../src';

/**
 * Examples demonstrating advanced container patterns and real-world scenarios
 */

interface EmitterInterface {
  on(_event: string, _callback: Function): void;
  emit(_event: string, _data?: any): void;
}

// Event emitter for event-driven architecture
class EventEmitter implements EmitterInterface {
  private events: Map<string, Function[]> = new Map();

  on(event: string, callback: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  emit(event: string, data?: any) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

interface ApplicationContextInterface {
  start(): void;
  stop(): void;
}

// Application context that manages services
class ApplicationContext implements ApplicationContextInterface {
  constructor(
    private eventEmitter: EventEmitter,
    private _config: any,
    private _logger: any,
  ) {}

  start() {
    this.logger.log('Application starting...');
    this.eventEmitter.emit('app:started', { timestamp: new Date() });
    this.logger.log('Application started successfully');
  }

  stop() {
    this.logger.log('Application stopping...');
    this.eventEmitter.emit('app:stopped', { timestamp: new Date() });
    this.logger.log('Application stopped');
  }
}

interface ServiceInterface {
  init(): void;
  destroy(): void;
}

// Service with lifecycle management
class LifecycleService implements ServiceInterface {
  public id: string;

  constructor() {
    this.id = Math.random().toString(36).substr(2, 9);
    console.log(`LifecycleService ${this.id} created`);
  }

  init() {
    console.log(`LifecycleService ${this.id} initialized`);
  }

  destroy() {
    console.log(`LifecycleService ${this.id} destroyed`);
  }
}

function advancedPatternsExamples() {
  console.log('=== Advanced Patterns Examples ===\n');

  const types = {
    EmitterInterface: Symbol('EmitterInterface'),
    ApplicationContextInterface: Symbol('ApplicationContextInterface'),
    ServiceInterface: Symbol('ServiceInterface'),
  };

  const container = new Container();

  // 1. Complex dependency graph
  container.set(types.EmitterInterface, () => new EventEmitter(), true);
  container.set(
    types.ApplicationContextInterface,
    (c: Container) => {
      const logger = {
        log: (message: string) => console.log(`[${new Date().toISOString()}] ${message}`),
        error: (message: string) => console.error(`[ERROR] ${message}`),
        warn: (message: string) => console.warn(`[WARN] ${message}`),
      };
      const config = {
        name: 'My App',
        version: '2.0.0',
        environment: 'development',
      };
      return new ApplicationContext(c.get(types.EmitterInterface), config, logger);
    },
    true,
  );

  // 2. Event-driven architecture
  const eventEmitter = container.get<EventEmitter>(types.EmitterInterface);
  const appContext = container.get<ApplicationContext>(types.ApplicationContextInterface);

  // Subscribe to events
  eventEmitter.on('app:started', (data: any) => {
    console.log('Event received: app:started', data);
  });

  eventEmitter.on('app:stopped', (data: any) => {
    console.log('Event received: app:stopped', data);
  });

  // Start the application
  appContext.start();

  // 3. Service lifecycle management
  container.set(types.ServiceInterface, () => new LifecycleService(), true);

  const service1 = container.get<LifecycleService>(types.ServiceInterface);
  const service2 = container.get<LifecycleService>(types.ServiceInterface);

  service1.init();
  service2.init();

  console.log('\nService lifecycle:');
  console.log('Service 1 ID:', service1.id);
  console.log('Service 2 ID:', service2.id);
  console.log('Different instances:', service1.id !== service2.id);
}

advancedPatternsExamples();
