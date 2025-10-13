import { Container } from './src';

class Y {}

class X {
  constructor(public y: Y) {}
}

const x = Symbol('X');
const y = Symbol('Y');

const container = new Container();

container.set(y, Y);
container.set(x, X);

container.bind(x, [y]);

// eslint-disable-next-line no-console, no-undef
console.log('Container created successfully');
// eslint-disable-next-line no-console, no-undef
console.log('Getting X instance...');
const xInstance = container.get<X>(x);
// eslint-disable-next-line no-console, no-undef
console.log('X instance:', xInstance);
// eslint-disable-next-line no-console, no-undef
console.log('X instance is instance of X:', xInstance instanceof X);
// eslint-disable-next-line no-console, no-undef
console.log('X instance has Y dependency:', xInstance.y instanceof Y);
