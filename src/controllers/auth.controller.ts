import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {get, post, Request, requestBody, Response, RestBindings, SchemaObject} from '@loopback/rest';
import {genSalt, hash} from 'bcryptjs';
import {JWT_STRATEGY_NAME} from '../auth/jwt.strategy';
import {OPENID_STRATEGY_NAME} from '../auth/open-id-connect.strategy';
import {BackplaneUserProfile, createUser, setUserPassword} from '../auth/users';
import {JWT_AUD, JWT_COOKIE_OPTIONS, JWT_ISS, JWT_SECRET} from '../auth/jwt.options';
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

  private addJWTCookie(user: BackplaneUserProfile, response: Response) {
    const jwtClaims = {
      sub: user.email,
      iss: JWT_ISS,
      aud: JWT_AUD,
      exp: Math.floor(Date.now() / 1000) + 604800,
      email: user.email,
      scopes: user.scopes,
    };

    const token = jwt.sign(jwtClaims, JWT_SECRET);

    response.cookie('jwt', token, JWT_COOKIE_OPTIONS);
    return token;
  }

  @get('auth/login', {
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
    this.addJWTCookie(user, response);
    response.statusCode = 204;
  }

  @authenticate(JWT_STRATEGY_NAME)
  @get('auth/whoAmI', {
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
          schema: NewUserRequest,
        },
      },
    })
      newUserRequest: NewUserRequest,
  ): Promise<string> {
    const password = await hash(newUserRequest.password, await genSalt());
    const user = createUser(newUserRequest.email, password);
    return user.email;
  }

  @authenticate(JWT_STRATEGY_NAME)
  @post('auth/setPassword', {
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
    setUserPassword(currentUser.email, password);
    return currentUser.email;
  }


  // --------------------------------------------------------------------------------------
  // --------------------------------       OpenId       ----------------------------------
  // --------------------------------------------------------------------------------------

  @authenticate(OPENID_STRATEGY_NAME)
  @get('/auth/openid/login', {
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
    response.statusCode = 204;
    this.addJWTCookie(user, response);
  }
}
