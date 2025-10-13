import { Container } from '../src';

/**
 * Examples showing factory functions and protection mechanisms
 */

type SmtpConfig = {
  host: string;
  port?: number;
};

class EmailService {
  constructor(private _smtpConfig: SmtpConfig) {}

  send(to: string, subject: string) {
    return `Sending email to ${to} with subject "${subject}" via ${this.smtpConfig.host}`;
  }
}

class NotificationService {
  constructor(private _emailService: EmailService) {}

  notify(userId: string, message: string) {
    return this.emailService.send(`user${userId}@example.com`, message);
  }
}

function factoriesAndProtectionExamples() {
  console.log('=== Factories and Protection Examples ===\n');

  const container = new Container();

  // 1. Factory functions (new instance each time) - Traditional method
  const emailServiceFactory = (_c: Container) => {
    const config = c.get<SmtpConfig>('smtpConfig');
    return new EmailService(config);
  };

  container.factory(emailServiceFactory);
  container.set('emailService', emailServiceFactory);

  // 1b. Factory functions - New direct method using set with factory=true
  const emailServiceFactory2 = (_c: Container) => {
    const config = c.get<SmtpConfig>('smtpConfig');
    return new EmailService(config);
  };

  container.set('emailService2', emailServiceFactory2, true);

  // Register SMTP config
  container.set('smtpConfig', { host: 'smtp.gmail.com', port: 587 } as SmtpConfig);

  console.log('Factory functions:');
  const email1 = container.get<EmailService>('emailService');
  const email2 = container.get<EmailService>('emailService');
  console.log('Different instances (traditional method):', email1 !== email2);

  const email3 = container.get<EmailService>('emailService2');
  const email4 = container.get<EmailService>('emailService2');
  console.log('Different instances (direct method):', email3 !== email4);

  // 2. Protected callables (return function itself)
  const protectedFactory = (_c: Container) => {
    return new EmailService({ host: 'protected.smtp.com' });
  };

  container.protect(protectedFactory);
  container.set('protectedEmailService', protectedFactory);

  console.log('\nProtected callables:');
  const protectedResult = container.get<EmailService>('protectedEmailService');
  console.log('Protected result type:', typeof protectedResult);
  console.log('Is function:', typeof protectedResult === 'function');

  // 3. Implicit factories (frozen after first use)
  const implicitFactory = (_c: Container) => {
    return new NotificationService(c.get<EmailService>('emailService'));
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
  const traditionalFactory = (_c: Container) => 'traditional';
  container.factory(traditionalFactory);
  container.set('traditional', traditionalFactory);

  // Method 2: Direct set with factory=true
  const directFactory = (_c: Container) => 'direct';
  container.set('direct', directFactory, true);

  // Both should work identically
  console.log('Traditional method result:', container.get<string>('traditional'));
  console.log('Direct method result:', container.get<string>('direct'));
  console.log(
    'Both methods equivalent:',
    container.get<string>('traditional') === container.get<string>('direct'),
  );

  // 7. Explicit factory=false behavior
  console.log('\nExplicit factory=false behavior:');
  const regularValue = 'regularValue';
  container.set('explicitRegular', regularValue, false);
  console.log('Explicit regular value:', container.get<string>('explicitRegular'));
  console.log(
    'Raw value is not a function:',
    typeof container.raw<string>('explicitRegular') !== 'function',
  );
}

factoriesAndProtectionExamples();
