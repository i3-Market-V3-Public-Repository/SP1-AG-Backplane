import {ByeService, ByeServiceProvider} from '../../services';
import {service} from '@loopback/core';
import {api, operation, requestBody} from '@loopback/rest';
import {ByeResponse} from '../../models';
import {authenticate} from '@loopback/authentication';
import {JWT_STRATEGY_NAME} from '../../auth/jwt.strategy';


/**
 * The controller class is generated from OpenAPI spec with operations tagged
 * by ByeController.
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
@authenticate(JWT_STRATEGY_NAME)
export class ByeController {
  constructor(@service(ByeServiceProvider) public byeService: ByeService) {
  }

  /**
   *
   *
   * @param _requestBody
   * @returns Bye Response
   */
  @operation('get', '/bye/alligator', {
    'x-controller-name': 'ByeController',
    'x-operation-name': 'byeAlligator',
    tags: [
      'ByeController',
    ],
    responses: {
      '200': {
        description: 'Bye Response',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ByeResponse',
            },
          },
        },
      },
    },
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'string',
          },
        },
      },
    },
    operationId: 'ByeController.byeAlligator',
  })
  async byeAlligator(@requestBody({
    content: {
      'application/json': {
        schema: {
          type: 'string',
        },
      },
    },
  }) _requestBody: string): Promise<ByeResponse> {
    return this.byeService.byeAlligator(_requestBody);
  }

  /**
   *
   *
   * @returns Bye Response
   */
  @operation('post', '/bye/normal', {
    'x-controller-name': 'ByeController',
    'x-operation-name': 'byeNormalPost',
    tags: [
      'ByeController',
    ],
    responses: {
      '200': {
        description: 'Bye Response',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ByeResponse',
            },
          },
        },
      },
    },
    operationId: 'ByeController.byeNormalPost',
  })
  async byeNormalPost(): Promise<ByeResponse> {
    return this.byeService.byeNormalPost();
  }

  /**
   *
   *
   * @returns Bye Response
   */
  @operation('get', '/bye/normal', {
    'x-controller-name': 'ByeController',
    'x-operation-name': 'byeNormal',
    tags: [
      'ByeController',
    ],
    responses: {
      '200': {
        description: 'Bye Response',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ByeResponse',
            },
          },
        },
      },
    },
    operationId: 'ByeController.byeNormal',
  })
  async byeNormal(): Promise<ByeResponse> {
    return this.byeService.byeNormal();
  }

}

