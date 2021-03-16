import {FarewellService, FarewellServiceProvider} from '../../services';
import {service} from '@loopback/core';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {JWT_STRATEGY_NAME} from '../../auth/jwt.strategy';
import {SecurityBindings} from '@loopback/security';
import {BackplaneUserProfile} from '../../auth/users';
import {Request, RestBindings} from '@loopback/rest';
import {inject} from '@loopback/core';
import {sign} from 'jsonwebtoken';
import {api, operation, param, requestBody} from '@loopback/rest';
import {FarewellRequestBody} from '../../models';
import {FarewellResponse} from '../../models';

/**
 * The controller class is generated from OpenAPI spec with operations tagged
 * by FarewellController.
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
export class FarewellController {
  private readonly secret: string;

  constructor(@service(FarewellServiceProvider) public farewellService: FarewellService,
              @inject(RestBindings.Http.REQUEST) private request: Request,
              @inject('config.secrets') private secrets: {[service: string]: string}) {
    this.secret = this.secrets['greeter'];
  }

  /**
   *
   *
   * @param user
   * @param _requestBody Farewell Request Body
   * @returns Farewell Response
   */
  @operation('post', '/farewell/body', {
    'x-controller-name': 'FarewellController',
    'x-operation-name': 'farewellBody',
    tags: [
      'FarewellController',
    ],
    responses: {
      '200': {
        description: 'Farewell Response',
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/FarewellResponse',
            },
          },
        },
      },
    },
    security: [
      {
        openIdConnect: [],
      },
    ],
    requestBody: {
      description: 'Farewell Request Body',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/FarewellRequestBody',
          },
        },
      },
    },
    operationId: 'FarewellController.farewellBody',
    parameters: [],
  })
  @authenticate(JWT_STRATEGY_NAME)
  async farewellBody(@inject(SecurityBindings.USER) user: BackplaneUserProfile, @requestBody({
    description: 'Farewell Request Body',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/FarewellRequestBody',
        },
      },
    },
  }) _requestBody: FarewellRequestBody): Promise<FarewellResponse> {
    const backplaneAuthorization = `${sign(user, this.secret)}`;
    const backplaneToken = this.request.headers['authorization']!;
    return this.farewellService.farewellBody(backplaneAuthorization, backplaneToken, _requestBody);
  }

  /**
   *
   *
   * @param user
   * @param name
   * @param age
   * @returns Farewell Response
   */
  @operation('get', '/farewell/headerParams', {
    'x-controller-name': 'FarewellController',
    'x-operation-name': 'farewellHeaderParams',
    tags: [
      'FarewellController',
    ],
    responses: {
      '200': {
        description: 'Farewell Response',
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/FarewellResponse',
            },
          },
        },
      },
    },
    security: [
      {
        openIdConnect: [
          'params',
        ],
      },
    ],
    parameters: [
      {
        name: 'name',
        in: 'header',
        schema: {
          type: 'string',
        },
        required: true,
      },
      {
        name: 'age',
        in: 'header',
        schema: {
          type: 'number',
        },
      },
    ],
    operationId: 'FarewellController.farewellHeaderParams',
  })
  @authenticate(JWT_STRATEGY_NAME)
  @authorize({scopes: ['params']})
  async farewellHeaderParams(@inject(SecurityBindings.USER) user: BackplaneUserProfile, @param({
    name: 'name',
    in: 'header',
    schema: {
      type: 'string',
    },
    required: true,
  }) name: string, @param({
    name: 'age',
    in: 'header',
    schema: {
      type: 'number',
    },
  }) age: number | undefined): Promise<FarewellResponse> {
    const backplaneAuthorization = `${sign(user, this.secret)}`;
    const backplaneToken = this.request.headers['authorization']!;
    return this.farewellService.farewellHeaderParams(backplaneAuthorization, backplaneToken, name, age);
  }

  /**
   *
   *
   * @param user
   * @param name
   * @param age
   * @returns Farewell Response
   */
  @operation('get', '/farewell/pathParams/{name}/{age}', {
    'x-controller-name': 'FarewellController',
    'x-operation-name': 'farewellPathParams',
    tags: [
      'FarewellController',
    ],
    responses: {
      '200': {
        description: 'Farewell Response',
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/FarewellResponse',
            },
          },
        },
      },
    },
    security: [
      {
        openIdConnect: [
          'params',
        ],
      },
    ],
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
        in: 'path',
        schema: {
          type: 'number',
        },
        required: true,
      },
    ],
    operationId: 'FarewellController.farewellPathParams',
  })
  @authenticate(JWT_STRATEGY_NAME)
  @authorize({scopes: ['params']})
  async farewellPathParams(@inject(SecurityBindings.USER) user: BackplaneUserProfile, @param({
    name: 'name',
    in: 'path',
    schema: {
      type: 'string',
    },
    required: true,
  }) name: string, @param({
    name: 'age',
    in: 'path',
    schema: {
      type: 'number',
    },
    required: true,
  }) age: number): Promise<FarewellResponse> {
    const backplaneAuthorization = `${sign(user, this.secret)}`;
    const backplaneToken = this.request.headers['authorization']!;
    return this.farewellService.farewellPathParams(backplaneAuthorization, backplaneToken, name, age);
  }

  /**
   *
   *
   * @param user
   * @param name
   * @param age
   * @returns Farewell Response
   */
  @operation('get', '/farewell/queryParams', {
    'x-controller-name': 'FarewellController',
    'x-operation-name': 'farewellQueryParams',
    tags: [
      'FarewellController',
    ],
    responses: {
      '200': {
        description: 'Farewell Response',
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/FarewellResponse',
            },
          },
        },
      },
    },
    security: [
      {
        openIdConnect: [
          'params',
        ],
      },
    ],
    parameters: [
      {
        name: 'name',
        in: 'query',
        schema: {
          type: 'string',
        },
        required: true,
      },
      {
        name: 'age',
        in: 'query',
        schema: {
          type: 'number',
        },
      },
    ],
    operationId: 'FarewellController.farewellQueryParams',
  })
  @authenticate(JWT_STRATEGY_NAME)
  @authorize({scopes: ['params']})
  async farewellQueryParams(@inject(SecurityBindings.USER) user: BackplaneUserProfile, @param({
    name: 'name',
    in: 'query',
    schema: {
      type: 'string',
    },
    required: true,
  }) name: string, @param({
    name: 'age',
    in: 'query',
    schema: {
      type: 'number',
    },
  }) age: number | undefined): Promise<FarewellResponse> {
    const backplaneAuthorization = `${sign(user, this.secret)}`;
    const backplaneToken = this.request.headers['authorization']!;
    return this.farewellService.farewellQueryParams(backplaneAuthorization, backplaneToken, name, age);
  }

}

