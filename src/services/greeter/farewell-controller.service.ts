import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {GreeterDataSource} from '../../datasources';

import {FarewellRequestBody} from '../../models';
import {FarewellResponse} from '../../models';

/**
 * The service interface is generated from OpenAPI spec with operations tagged
 * by FarewellController.
 */
export interface FarewellService {
  /**
   * @param backplaneAuthorization 
   * @param backplaneToken 
   * @param _requestBody Farewell Request Body
   * @returns Farewell Response
   */
  farewellBody(backplaneAuthorization: string, backplaneToken: string, _requestBody: FarewellRequestBody): Promise<FarewellResponse>;

  /**
   * @param backplaneAuthorization 
   * @param backplaneToken 
   * @param name 
   * @param age 
   * @returns Farewell Response
   */
  farewellHeaderParams(backplaneAuthorization: string, backplaneToken: string, name: string, age: number | undefined): Promise<FarewellResponse>;

  /**
   * @param backplaneAuthorization 
   * @param backplaneToken 
   * @param name 
   * @param age 
   * @returns Farewell Response
   */
  farewellPathParams(backplaneAuthorization: string, backplaneToken: string, name: string, age: number): Promise<FarewellResponse>;

  /**
   * @param backplaneAuthorization 
   * @param backplaneToken 
   * @param name 
   * @param age 
   * @returns Farewell Response
   */
  farewellQueryParams(backplaneAuthorization: string, backplaneToken: string, name: string, age: number | undefined): Promise<FarewellResponse>;

}

export class FarewellServiceProvider implements Provider<FarewellService> {
  constructor(
    // greeter must match the name property in the datasource json file
    @inject('datasources.greeter')
    protected dataSource: GreeterDataSource = new GreeterDataSource(),
  ) {}

  async value(): Promise<FarewellService> {
    const service = await getService<{apis: {'FarewellController': FarewellService}}>(
      this.dataSource,
    );
    return service.apis['FarewellController'];
  }
}
