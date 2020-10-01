import {HelloService, HelloServiceProvider} from '../../services';
import {service} from '@loopback/core';
import {api, operation, param} from '@loopback/rest';
import {HelloResponse} from '../../models';
import {authenticate} from '@loopback/authentication';
import {OPENID_STRATEGY_NAME} from '../../auth/open-id-connect.strategy';

/**
 * The controller class is generated from OpenAPI spec with operations tagged
 * by HelloController.
 *
 */
@api({
  components: {
    schemas: {
      ByeResponse: {
        type: 'object',
        title: 'ByeResponse',
        properties: {
          greeting: {
            type: 'string',
          },
          random: {
            type: 'number',
          },
        },
      },
      HelloResponse: {
        type: 'object',
        title: 'HelloResponse',
        properties: {
          greeting: {
            type: 'string',
          },
          date: {
            type: 'string',
          },
          url: {
            type: 'string',
          },
        },
      },
    },
  },
  paths: {},
})
export class HelloController {
  constructor(@service(HelloServiceProvider) public helloService: HelloService) {
  }

  /**
   *
   *
   * @param name
   * @param age
   * @returns Hello Response
   */
  @operation('get', '/hello/{name}', {
    'x-controller-name': 'HelloController',
    'x-operation-name': 'hello',
    tags: [
      'HelloController',
    ],
    responses: {
      '200': {
        description: 'Hello Response',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/HelloResponse',
            },
          },
        },
      },
    },
    parameters: [
      {
        name: 'name',
        in: 'path',
        schema: {
          type: 'string',
        },
        required: true,
      },
      {
        name: 'age',
        in: 'query',
        schema: {
          type: 'integer',
          format: 'int32',
        },
      },
    ],
    operationId: 'HelloController.hello',
  })
  @authenticate(OPENID_STRATEGY_NAME)
  async hello(@param({
    name: 'name',
    in: 'path',
    schema: {
      type: 'string',
    },
    required: true,
  }) name: string, @param({
    name: 'age',
    in: 'query',
    schema: {
      type: 'integer',
      format: 'int32',
    },
  }) age: number | undefined): Promise<HelloResponse> {
    return this.helloService.hello(name, age);
  }

}

