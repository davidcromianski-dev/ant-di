import { Container } from '../src';

/**
 * Examples showing factory functions and protection mechanisms
 */

class EmailService {
    constructor(private smtpConfig: any) {}
    
    send(to: string, subject: string) {
        return `Sending email to ${to} with subject "${subject}" via ${this.smtpConfig.host}`;
    }
}

class NotificationService {
    constructor(private emailService: EmailService) {}
    
    notify(userId: string, message: string) {
        return this.emailService.send(`user${userId}@example.com`, message);
    }
}

function factoriesAndProtectionExamples() {
    console.log('=== Factories and Protection Examples ===\n');

    const container = new Container();

    // 1. Factory functions (new instance each time) - Traditional method
    const emailServiceFactory = (c: Container) => {
        const config = c.offsetGet('smtpConfig');
        return new EmailService(config);
    };

    container.factory(emailServiceFactory);
    container.offsetSet('emailService', emailServiceFactory);

    // 1b. Factory functions - New direct method using offsetSet with factory=true
    const emailServiceFactory2 = (c: Container) => {
        const config = c.offsetGet('smtpConfig');
        return new EmailService(config);
    };

    // New way: register factory directly with offsetSet
    container.offsetSet('emailService2', emailServiceFactory2, true);

    // Register SMTP config
    container.offsetSet('smtpConfig', { host: 'smtp.gmail.com', port: 587 });

    console.log('Factory functions:');
    const email1 = container.offsetGet('emailService');
    const email2 = container.offsetGet('emailService');
    console.log('Different instances (traditional method):', email1 !== email2);

    const email3 = container.offsetGet('emailService2');
    const email4 = container.offsetGet('emailService2');
    console.log('Different instances (direct method):', email3 !== email4);

    // 2. Protected callables (return function itself)
    const protectedFactory = (c: Container) => {
        return new EmailService({ host: 'protected.smtp.com' });
    };

    container.protect(protectedFactory);
    container.offsetSet('protectedEmailService', protectedFactory);

    console.log('\nProtected callables:');
    const protectedResult = container.offsetGet('protectedEmailService');
    console.log('Protected result type:', typeof protectedResult);
    console.log('Is function:', typeof protectedResult === 'function');

    // 3. Implicit factories (frozen after first use)
    const implicitFactory = (c: Container) => {
        return new NotificationService(c.offsetGet('emailService'));
    };

    container.offsetSet('notificationService', implicitFactory);

    console.log('\nImplicit factories:');
    const notification1 = container.offsetGet('notificationService');
    const notification2 = container.offsetGet('notificationService');
    console.log('Same instance (frozen):', notification1 === notification2);

    // 4. Frozen key behavior
    console.log('\nFrozen key behavior:');
    try {
        container.offsetSet('notificationService', 'new value');
    } catch (error: any) {
        console.log('Cannot modify frozen key:', error.message);
    }

    // 5. Raw value access
    console.log('\nRaw value access:');
    const rawValue = container.raw('notificationService');
    console.log('Raw value type:', typeof rawValue);
    console.log('Is function:', typeof rawValue === 'function');

    // 6. Demonstrating both factory registration methods
    console.log('\nFactory registration methods comparison:');
    
    // Method 1: Traditional factory() + offsetSet
    const traditionalFactory = (c: Container) => 'traditional';
    container.factory(traditionalFactory);
    container.offsetSet('traditional', traditionalFactory);
    
    // Method 2: Direct offsetSet with factory=true
    const directFactory = (c: Container) => 'direct';
    container.offsetSet('direct', directFactory, true);
    
    // Both should work identically
    console.log('Traditional method result:', container.offsetGet('traditional'));
    console.log('Direct method result:', container.offsetGet('direct'));
    console.log('Both methods equivalent:', container.offsetGet('traditional') === container.offsetGet('direct'));
    
    // 7. Explicit factory=false behavior
    console.log('\nExplicit factory=false behavior:');
    const regularValue = 'regularValue';
    container.offsetSet('explicitRegular', regularValue, false);
    console.log('Explicit regular value:', container.offsetGet('explicitRegular'));
    console.log('Raw value is not a function:', typeof container.raw('explicitRegular') !== 'function');
} 

factoriesAndProtectionExamples();