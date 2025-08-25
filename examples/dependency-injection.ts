import { Container } from '../src';

/**
 * Examples demonstrating dependency injection and auto-wiring
 */

// Service classes
class DatabaseConnection {
    constructor(private connectionString: string) {}
    
    query(sql: string) {
        return `Executing: ${sql} on ${this.connectionString}`;
    }
}

class UserRepository {
    constructor(private db: DatabaseConnection) {}
    
    findById(id: number) {
        return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
    }
}

class UserService {
    constructor(private userRepo: UserRepository) {}
    
    getUser(id: number) {
        return this.userRepo.findById(id);
    }
}

class Logger {
    log(message: string) {
        console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
    }
}

function dependencyInjectionExamples() {
    console.log('=== Dependency Injection Examples ===\n');

    const container = new Container();

    container.offsetSet('DatabaseConnection', (c: Container) => new DatabaseConnection('postgresql://localhost:5432/mydb'), true);

    // 1. Manual dependency registration
    container.bind(DatabaseConnection, [String]);
    container.bind(UserRepository, [DatabaseConnection]);
    container.bind(UserService, [UserRepository]);


    // 2. Auto-wiring with constructor injection
    const userService = container.offsetGet(UserService);
    console.log('User service result:', userService.getUser(123));

    // 3. Singleton behavior
    const userService1 = container.offsetGet(UserService);
    const userService2 = container.offsetGet(UserService);
    console.log('\nSingleton check:', userService1 === userService2);

    // 4. Dependency binding by name
    container.bind('Logger', []);
    const logger = container.offsetGet(Logger);
    logger.log('Application started');

    // 5. Circular dependency detection
    class ServiceA {
        constructor(public serviceB: ServiceB) {}
    }

    class ServiceB {
        constructor(public serviceA: ServiceA) {}
    }

    container.bind(ServiceA, [ServiceB]);
    container.bind(ServiceB, [ServiceA]);

    console.log('\nCircular dependency test:');
    try {
        container.offsetGet(ServiceA);
    } catch (error: any) {
        console.log('Caught circular dependency:', error.message);
    }
} 

dependencyInjectionExamples();