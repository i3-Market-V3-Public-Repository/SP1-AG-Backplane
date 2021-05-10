import {get, Request, ResponseObject, RestBindings} from '@loopback/rest';
import {inject} from '@loopback/core';
import {authenticate} from '@loopback/authentication';
import {JWT_SECURITY_SCHEMA, JWT_STRATEGY_NAME} from '../auth/jwt.strategy';
import {authorize} from '@loopback/authorization';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */

export class PingController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {
  }

  // Map to `GET /ping`
  @get('/ping', {
    description: 'Endpoint that returns a greeting along with some info of the request',
    responses: {
      '200': PING_RESPONSE,
    },
  })
  ping(): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }

  // Map to `GET /ping`
  @get('/pingUser', {
    description: 'Endpoint that returns a greeting along with some info of the request',
    security: [JWT_SECURITY_SCHEMA],
    responses: {
      '200': PING_RESPONSE,
    },
  })
  @authenticate(JWT_STRATEGY_NAME)
  pingUser(): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }

  // Map to `GET /ping`
  @get('/pingConsumer', {
    description: 'Endpoint that returns a greeting along with some info of the request',
    security: [JWT_SECURITY_SCHEMA],
    responses: {
      '200': PING_RESPONSE,
    },
  })
  @authenticate(JWT_STRATEGY_NAME)
  @authorize({scopes: ['consumer']})
  pingConsumer(): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }

  // Map to `GET /ping`
  @get('/pingProvider', {
    description: 'Endpoint that returns a greeting along with some info of the request',
    security: [JWT_SECURITY_SCHEMA],
    responses: {
      '200': PING_RESPONSE,
    },
  })
  @authenticate(JWT_STRATEGY_NAME)
  @authorize({scopes: ['provider']})
  pingProvider(): object {
    // Reply with a greeting, the current time, the url, and request headers
    return {
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: this.req.url,
      headers: Object.assign({}, this.req.headers),
    };
  }
}
