import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  get,
  getModelSchemaRef,
  post,
  requestBody,
  RequestWithSession,
  Response,
  RestBindings,
  SchemaObject,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {genSalt, hash} from 'bcryptjs';
import {JWT_STRATEGY_NAME} from '../auth/jwt.strategy';
import {OPENID_STRATEGY_NAME} from '../auth/open-id-connect.strategy';
import {createUser, User} from '../auth/users';
import {JWT_AUD, JWT_COOKIE_OPTIONS, JWT_ISS, JWT_SECRET} from '../auth/jwt.options';
import * as jwt from 'jsonwebtoken';
import {LOCAL_STRATEGY_NAME} from '../auth/local.strategy';

export class NewUserRequest extends User {
  email: string;
  password: string;
}

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      example: 'password',
      minLength: 8,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

export class AuthController {
  constructor() {
  }

  @post('auth/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  @authenticate(LOCAL_STRATEGY_NAME)
  async login(
    @requestBody(CredentialsRequestBody) user: User,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const jwtClaims = {
      sub: user.email,
      iss: JWT_ISS,
      aud: JWT_AUD,
      exp: Math.floor(Date.now() / 1000) + 604800, // 1 weak (7×24×60×60=604800s) from now
      email: user.email,
    };

    const token = jwt.sign(jwtClaims, JWT_SECRET);

    response.cookie('jwt', token, JWT_COOKIE_OPTIONS);
    // TODO remove token return
    return token;
  }

  @authenticate(JWT_STRATEGY_NAME)
  @get('auth/whoAmI', {
    responses: {
      '200': {
        description: '',
        schema: {
          type: 'string',
        },
      },
    },
  })
  async whoAmI(
    @inject(SecurityBindings.USER)
      currentUserProfile: UserProfile,
  ): Promise<string> {
    return currentUserProfile[securityId];
  }

  @post('auth/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              'x-ts-type': User,
            },
          },
        },
      },
    },
  })
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: CredentialsSchema,
        },
      },
    })
      newUserRequest: NewUserRequest,
  ): Promise<string> {
    const password = await hash(newUserRequest.password, await genSalt());
    const user = createUser(newUserRequest.email, password);
    return user.email;
  }


  // --------------------------------------------------------------------------------------
  // --------------------------------       OpenId       ----------------------------------
  // --------------------------------------------------------------------------------------

  @authenticate(OPENID_STRATEGY_NAME)
  @get('/auth/openid/login')
  loginWitOpenIdConnectProvider(
    @inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_URL)
      redirectUrl: string,
    @inject(AuthenticationBindings.AUTHENTICATION_REDIRECT_STATUS)
      status: number,
    @inject(RestBindings.Http.RESPONSE)
      response: Response,
  ) {
    response.statusCode = status || 302;
    response.setHeader('Location', redirectUrl);
    response.end();
    return response;
  }

  @get('/auth/openid/callback')
  async openIdConnectCallback(
    @inject(SecurityBindings.USER) user: UserProfile,
    @inject(RestBindings.Http.REQUEST) request: RequestWithSession,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    console.log('callback');
    return response;
  }
}
