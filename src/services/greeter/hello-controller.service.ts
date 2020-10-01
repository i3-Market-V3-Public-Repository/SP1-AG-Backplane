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
   * @param name 
   * @param age 
   * @returns Hello Response
   */
  hello(name: string, age: number | undefined): Promise<HelloResponse>;

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
