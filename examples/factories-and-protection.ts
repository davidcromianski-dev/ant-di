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

export function factoriesAndProtectionExamples() {
    console.log('=== Factories and Protection Examples ===\n');

    const container = new Container();

    // 1. Factory functions (new instance each time)
    const emailServiceFactory = (c: Container) => {
        const config = c.offsetGet('smtpConfig');
        return new EmailService(config);
    };

    container.factory(emailServiceFactory);
    container.offsetSet('emailService', emailServiceFactory);

    // Register SMTP config
    container.offsetSet('smtpConfig', { host: 'smtp.gmail.com', port: 587 });

    console.log('Factory functions:');
    const email1 = container.offsetGet('emailService');
    const email2 = container.offsetGet('emailService');
    console.log('Different instances:', email1 !== email2);

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
} 