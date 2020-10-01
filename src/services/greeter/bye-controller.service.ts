import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {GreeterDataSource} from '../../datasources';

import {ByeResponse} from '../../models';

/**
 * The service interface is generated from OpenAPI spec with operations tagged
 * by ByeController.
 */
export interface ByeService {
  /**
   * @param _requestBody
   * @returns Bye Response
   */
  byeAlligator(_requestBody: string): Promise<ByeResponse>;

  /**
   * @returns Bye Response
   */
  byeNormalPost(): Promise<ByeResponse>;

  /**
   * @returns Bye Response
   */
  byeNormal(): Promise<ByeResponse>;

}

export class ByeServiceProvider implements Provider<ByeService> {
  constructor(
    // greeter must match the name property in the datasource json file
    @inject('datasources.greeter')
    protected dataSource: GreeterDataSource = new GreeterDataSource(),
  ) {}

  async value(): Promise<ByeService> {
    const service = await getService<{apis: {'ByeController': ByeService}}>(
      this.dataSource,
    );
    return service.apis['ByeController'];
  }
}
