import { ContainerInterface } from './ContainerInterface';

export interface ServiceProviderInterface {
  register(container: ContainerInterface): this;
}
