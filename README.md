# Ant DI
## Simple JavaScript Dependency Injection Package

This package is a simple dependency injection container for JavaScript. It is inspired by the PHP Pimple package.

## Installation

```bash
npm install ant-di
```

## Usage

### Provider.ts
```typescript 
import { Provider } from '@ant-di';
import { Dependency } from '@some-dependency';
import { AnotherDependency } from '@another-dependency';
import { SomeClass } from './SomeClass';

export class CustomProvider implements Provider {
    public register(container: Container): void {
        container.set('Dependency', (container: Container) => {
            return new Dependency();
        });
        container.set('AnotherDependency', (container: Container) => {
            return new AnotherDependency();
        });
        container.set('SomeClass', (container: Container) => {
            return new SomeClass(
                container.get('dependency'),
                container.get('anotherDependency')
            );
        });
    }
}
```

### DummyClass.ts
```typescript
import { Container, Provider } from '@ant-di';
import { CustomProvider } from './Provider';

export class DummyClass {
    private container: Container;

    public constructor() {
        this.container = new Container();
        this.container.register(new CustomProvider());
        this.container.set('key', 'value');
    }
    
    public run(): string {
        const someClass = this.container.get('SomeClass') as SomeClass;
        return someClass.doSomething();
    }
}
```
