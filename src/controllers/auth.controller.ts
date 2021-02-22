import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {get, post, Request, requestBody, Response, RestBindings, SchemaObject} from '@loopback/rest';
import {genSalt, hash} from 'bcryptjs';
import {JWT_SECURITY_SCHEMA, JWT_STRATEGY_NAME} from '../auth/jwt.strategy';
import {OPENID_SECURITY_SCHEMA, OPENID_STRATEGY_NAME} from '../auth/open-id-connect.strategy';
import {BackplaneUserProfile, createUser, setUserPassword} from '../auth/users';
import {JWT_AUD, JWT_ISS, JWT_SECRET} from '../auth/jwt.options';
import * as jwt from 'jsonwebtoken';
import {LOCAL_STRATEGY_NAME} from '../auth/local.strategy';
import path from 'path';
import {NewUserRequest} from '../models';

const PasswordSchema: SchemaObject = {
  type: 'object',
  title: 'Password',
  required: ['password'],
  properties: {
    password: {
      type: 'string',
      example: 'password',
      minLength: 8,
    },
  },
};


const UserProfileSchema: SchemaObject = {
  type: 'object',
  title: 'User profile',
  properties: {
    email: {
      type: 'string',
      format: 'email',
      example: 'email@example.com',
    },
    scopes: {
      type: 'array',
      items: {
        type: 'string',
        example: 'ping',
      },
    },
  },
};

export class AuthController {
  constructor() {
  }

  private static getJWT(user: BackplaneUserProfile) {
    const jwtClaims = {
      sub: user.id,
      iss: JWT_ISS,
      aud: JWT_AUD,
      exp: Math.floor(Date.now() / 1000) + 604800,
      scopes: user.scopes,
    };

    return jwt.sign(jwtClaims, JWT_SECRET);
  }

  @get('auth/login', {
    description: 'Login page of the Backplane',
    responses: {
      '200': {
        description: 'Login page',
      },
    },
  })
  async getLoginPage(@inject(RestBindings.Http.RESPONSE) response: Response) {
    response.sendFile(path.join(__dirname, '../../public/login.html'));
    return response;
  }

  @post('auth/login', {
    description: 'Endpoint to log in to the Backplane with username and password',
    requestBody: {
      content: {
        'application/json': {
          schema: {$ref: '#/components/schemas/NewUserRequest'},
        },
      },
    },
    responses: {
      '204': {
        description: 'No content',
      },
    },
  })
  @authenticate(LOCAL_STRATEGY_NAME)
  async login(
    @inject(AuthenticationBindings.CURRENT_USER) user: BackplaneUserProfile,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    response.statusCode = 200;
    const token = AuthController.getJWT(user);
    response.json({type: 'jwt', token});
  }

  @authenticate(JWT_STRATEGY_NAME)
  @get('auth/whoAmI', {
    description: 'Endpoint to get the user profile of the logged in user',
    security: [
      JWT_SECURITY_SCHEMA,
    ],
    responses: {
      '200': {
        description: 'User profile',
        content: {
          'application/json': {
            schema: UserProfileSchema,
          },
        },
      },
    },
  })
  async whoAmI(
    @inject(AuthenticationBindings.CURRENT_USER)
      currentUserProfile: BackplaneUserProfile,
  ): Promise<BackplaneUserProfile> {
    return currentUserProfile;
  }

  @post('auth/signup', {
    description: 'Endpoint to register a new user',
    responses: {
      '200': {
        description: 'UserResponse',
        content: {
          'application/json': {
            schema: {
              type: 'string',
              title: 'Email',
              example: 'email@example.com',
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
          schema: {$ref: '#/components/schemas/NewUserRequest'},
        },
      },
    })
      newUserRequest: NewUserRequest,
  ): Promise<string> {
    const password = await hash(newUserRequest.password, await genSalt());
    const user = createUser(newUserRequest.email, [],  password);
    return user.id;
  }

  @authenticate(JWT_STRATEGY_NAME)
  @post('auth/setPassword', {
    description: 'Endpoint to set/change the password of the current user',
    security: [
      JWT_SECURITY_SCHEMA,
    ],
    responses: {
      '200': {
        description: 'Password',
        content: {
          'application/json': {
            schema: {
              type: 'string',
              title: 'Email',
              example: 'email@example.com',
            },
          },
        },
      },
    },
  })
  async setPassword(
    @requestBody({
      content: {
        'application/json': {
          schema: PasswordSchema,
        },
      },
    })
      newPassword: {password: string},
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: BackplaneUserProfile,
  ): Promise<string> {
    const password = await hash(newPassword.password, await genSalt());
    setUserPassword(currentUser.id, password);
    return currentUser.id;
  }


  // --------------------------------------------------------------------------------------
  // --------------------------------       OpenId       ----------------------------------
  // --------------------------------------------------------------------------------------

  @authenticate({strategy: OPENID_STRATEGY_NAME, options: {isLoginEndpoint: true}})
  @get('/auth/openid/login', {
    description: 'Endpoint to start the authentication with an external OpenId Provider',
    security: [
      OPENID_SECURITY_SCHEMA,
    ],
    responses: {
      '302': {
        description: 'Redirection to OpenId Provider login page',
      },
    },
  })
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

  @authenticate(OPENID_STRATEGY_NAME)
  @get('/auth/openid/callback', {
    description: 'Callback for the OpenId Provider to call after login',
    security: [
      OPENID_SECURITY_SCHEMA,
    ],
    responses: {
      '204': {
        description: 'No content',
      },
    },
  })
  async openIdConnectCallback(
    @inject(AuthenticationBindings.CURRENT_USER) user: BackplaneUserProfile,
    @inject(RestBindings.Http.REQUEST) request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    response.statusCode = 200;
    const token = AuthController.getJWT(user);
    response.json({type: 'jwt', token});
  }
}
