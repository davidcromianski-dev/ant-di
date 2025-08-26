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
        const config = c.get('smtpConfig');
        return new EmailService(config);
    };

    container.factory(emailServiceFactory);
    container.set('emailService', emailServiceFactory);

    // 1b. Factory functions - New direct method using set with factory=true
    const emailServiceFactory2 = (c: Container) => {
        const config = c.get('smtpConfig');
        return new EmailService(config);
    };

    container.set('emailService2', emailServiceFactory2, true);

    // Register SMTP config
    container.set('smtpConfig', { host: 'smtp.gmail.com', port: 587 });

    console.log('Factory functions:');
    const email1 = container.get('emailService');
    const email2 = container.get('emailService');
    console.log('Different instances (traditional method):', email1 !== email2);

    const email3 = container.get('emailService2');
    const email4 = container.get('emailService2');
    console.log('Different instances (direct method):', email3 !== email4);

    // 2. Protected callables (return function itself)
    const protectedFactory = (c: Container) => {
        return new EmailService({ host: 'protected.smtp.com' });
    };

    container.protect(protectedFactory);
    container.set('protectedEmailService', protectedFactory);

    console.log('\nProtected callables:');
    const protectedResult = container.get('protectedEmailService');
    console.log('Protected result type:', typeof protectedResult);
    console.log('Is function:', typeof protectedResult === 'function');

    // 3. Implicit factories (frozen after first use)
    const implicitFactory = (c: Container) => {
        return new NotificationService(c.get('emailService'));
    };

    container.set('notificationService', implicitFactory);

    console.log('\nImplicit factories:');
    const notification1 = container.get('notificationService');
    const notification2 = container.get('notificationService');
    console.log('Same instance (frozen):', notification1 === notification2);

    // 4. Frozen key behavior
    console.log('\nFrozen key behavior:');
    try {
        container.set('notificationService', 'new value');
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
    
    // Method 1: Traditional factory() + set
    const traditionalFactory = (c: Container) => 'traditional';
    container.factory(traditionalFactory);
    container.set('traditional', traditionalFactory);
    
    // Method 2: Direct set with factory=true
    const directFactory = (c: Container) => 'direct';
    container.set('direct', directFactory, true);
    
    // Both should work identically
    console.log('Traditional method result:', container.get('traditional'));
    console.log('Direct method result:', container.get('direct'));
    console.log('Both methods equivalent:', container.get('traditional') === container.get('direct'));
    
    // 7. Explicit factory=false behavior
    console.log('\nExplicit factory=false behavior:');
    const regularValue = 'regularValue';
    container.set('explicitRegular', regularValue, false);
    console.log('Explicit regular value:', container.get('explicitRegular'));
    console.log('Raw value is not a function:', typeof container.raw('explicitRegular') !== 'function');
} 

factoriesAndProtectionExamples();