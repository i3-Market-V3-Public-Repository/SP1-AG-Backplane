import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {GreeterDataSource} from '../../datasources';

import {HelloResponse} from '../../models';

/**
 * The service interface is generated from OpenAPI spec with operations tagged
 * by HelloController.
 */
export interface HelloService {
  /**
   * @param backplaneAuthorization 
   * @param backplaneToken 
   * @returns Hello Response
   */
  helloAuthenticated(backplaneAuthorization: string, backplaneToken: string): Promise<HelloResponse>;

  /**
   * @param backplaneAuthorization 
   * @param backplaneToken 
   * @returns Hello Response
   */
  helloConsumer(backplaneAuthorization: string, backplaneToken: string): Promise<HelloResponse>;

  /**
   * @param backplaneAuthorization 
   * @param backplaneToken 
   * @returns Hello Response
   */
  helloProvider(backplaneAuthorization: string, backplaneToken: string): Promise<HelloResponse>;

  /**
   * @param name 
   * @returns Hello Response
   */
  helloUnauthenticated(name: string): Promise<HelloResponse>;

}

export class HelloServiceProvider implements Provider<HelloService> {
  constructor(
    // greeter must match the name property in the datasource json file
    @inject('datasources.greeter')
    protected dataSource: GreeterDataSource = new GreeterDataSource(),
  ) {}

  async value(): Promise<HelloService> {
    const service = await getService<{apis: {'HelloController': HelloService}}>(
      this.dataSource,
    );
    return service.apis['HelloController'];
  }
}
