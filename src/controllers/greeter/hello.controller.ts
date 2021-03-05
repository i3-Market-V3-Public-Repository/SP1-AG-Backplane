import {HelloService, HelloServiceProvider} from '../../services';
import {inject, service} from '@loopback/core';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {JWT_STRATEGY_NAME} from '../../auth/jwt.strategy';
import {SecurityBindings} from '@loopback/security';
import {BackplaneUserProfile} from '../../auth/users';
import {sign} from 'jsonwebtoken';
import {api, operation, param} from '@loopback/rest';
import {HelloResponse} from '../../models';

/**
 * The controller class is generated from OpenAPI spec with operations tagged
 * by HelloController.
 *
 */
@api({
  components: {
    schemas: {
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
    securitySchemes: {
      jwt: {
        type: 'apiKey',
        in: 'header',
        name: 'user',
      },
    },
  },
  paths: {},
})
export class HelloController {
  constructor(@inject('config.secrets') private secrets: {[service: string]: string},
              @service(HelloServiceProvider) public helloService: HelloService) {
  }

  /**
   *
   *
   * @param user
   * @returns Hello Response
   */
  @operation('get', '/hello/authenticated', {
    'x-controller-name': 'HelloController',
    'x-operation-name': 'helloAuthenticated',
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
    parameters: [],
    security: [
      {
        jwt: [],
      },
      {
        openIdConnect: [],
      },
    ],
    operationId: 'HelloController.helloAuthenticated',
  })
  @authenticate(JWT_STRATEGY_NAME)
  async helloAuthenticated(@inject(SecurityBindings.USER) user: BackplaneUserProfile): Promise<HelloResponse> {
    console.log('helloAuthenticated');
    const userJwt = sign(user, this.secrets.greeter);
    return this.helloService.helloAuthenticated(userJwt);
  }

  /**
   *
   *
   * @param user
   * @returns Hello Response
   */
  @operation('get', '/hello/consumer', {
    'x-controller-name': 'HelloController',
    'x-operation-name': 'helloConsumer',
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
    parameters: [],
    security: [
      {
        jwt: [],
      },
      {
        openIdConnect: [
          'consumer',
        ],
      },
    ],
    operationId: 'HelloController.helloConsumer',
  })
  @authenticate(JWT_STRATEGY_NAME)
  @authorize({scopes: ['consumer']})
  async helloConsumer(@inject(SecurityBindings.USER) user: BackplaneUserProfile): Promise<HelloResponse> {
    const userJwt = sign(user, this.secrets.greeter);
    return this.helloService.helloConsumer(userJwt);
  }

  /**
   *
   *
   * @param user
   * @returns Hello Response
   */
  @operation('get', '/hello/provider', {
    'x-controller-name': 'HelloController',
    'x-operation-name': 'helloProvider',
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
    parameters: [],
    security: [
      {
        jwt: [],
      },
      {
        openIdConnect: [
          'provider',
        ],
      },
    ],
    operationId: 'HelloController.helloProvider',
  })
  @authenticate(JWT_STRATEGY_NAME)
  @authorize({scopes: ['provider']})
  async helloProvider(@inject(SecurityBindings.USER) user: BackplaneUserProfile): Promise<HelloResponse> {
    const userJwt = sign(user, this.secrets.greeter);
    return this.helloService.helloProvider(userJwt);
  }

  /**
   *
   *
   * @param name
   * @returns Hello Response
   */
  @operation('get', '/hello/unauthenticated/{name}', {
    'x-controller-name': 'HelloController',
    'x-operation-name': 'helloUnauthenticated',
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
    ],
    operationId: 'HelloController.helloUnauthenticated',
  })
  async helloUnauthenticated(@param({
    name: 'name',
    in: 'path',
    schema: {
      type: 'string',
    },
    required: true,
  }) name: string): Promise<HelloResponse> {
    return this.helloService.helloUnauthenticated(name);
  }

}

