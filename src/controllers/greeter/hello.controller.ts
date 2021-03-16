import {HelloService, HelloServiceProvider} from '../../services';
import {service} from '@loopback/core';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {JWT_STRATEGY_NAME} from '../../auth/jwt.strategy';
import {SecurityBindings} from '@loopback/security';
import {BackplaneUserProfile} from '../../auth/users';
import {Request, RestBindings} from '@loopback/rest';
import {inject} from '@loopback/core';
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
      FarewellResponse: {
        type: 'object',
        title: 'FarewellResponse',
        properties: {
          farewell: {
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
      FarewellRequestBody: {
        type: 'object',
        title: 'FarewellRequestBody',
        properties: {
          name: {
            type: 'string',
          },
          age: {
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
    securitySchemes: {
      jwt: {
        type: 'apiKey',
        in: 'header',
        name: 'backplane-authorization',
      },
    },
  },
  paths: {},
})
export class HelloController {
  private readonly secret: string;

  constructor(@service(HelloServiceProvider) public helloService: HelloService,
              @inject(RestBindings.Http.REQUEST) private request: Request,
              @inject('config.secrets') private secrets: {[service: string]: string}) {
    this.secret = this.secrets['greeter'];
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
    security: [
      {
        jwt: [],
      },
      {
        openIdConnect: [],
      },
    ],
    operationId: 'HelloController.helloAuthenticated',
    parameters: [],
  })
  @authenticate(JWT_STRATEGY_NAME)
  async helloAuthenticated(@inject(SecurityBindings.USER) user: BackplaneUserProfile): Promise<HelloResponse> {
    const backplaneAuthorization = `${sign(user, this.secret)}`;
    const backplaneToken = this.request.headers['authorization']!;
    return this.helloService.helloAuthenticated(backplaneAuthorization, backplaneToken);
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
    parameters: [],
  })
  @authenticate(JWT_STRATEGY_NAME)
  @authorize({scopes: ['consumer']})
  async helloConsumer(@inject(SecurityBindings.USER) user: BackplaneUserProfile): Promise<HelloResponse> {
    const backplaneAuthorization = `${sign(user, this.secret)}`;
    const backplaneToken = this.request.headers['authorization']!;
    return this.helloService.helloConsumer(backplaneAuthorization, backplaneToken);
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
    parameters: [],
  })
  @authenticate(JWT_STRATEGY_NAME)
  @authorize({scopes: ['provider']})
  async helloProvider(@inject(SecurityBindings.USER) user: BackplaneUserProfile): Promise<HelloResponse> {
    const backplaneAuthorization = `${sign(user, this.secret)}`;
    const backplaneToken = this.request.headers['authorization']!;
    return this.helloService.helloProvider(backplaneAuthorization, backplaneToken);
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

