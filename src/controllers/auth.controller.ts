import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {get, post, Request, requestBody, Response, RestBindings, SchemaObject} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {genSalt, hash} from 'bcryptjs';
import {JWT_STRATEGY_NAME} from '../auth/jwt.strategy';
import {OPENID_STRATEGY_NAME} from '../auth/open-id-connect.strategy';
import {createUser, setUserPassword, User} from '../auth/users';
import {JWT_AUD, JWT_COOKIE_OPTIONS, JWT_ISS, JWT_SECRET} from '../auth/jwt.options';
import * as jwt from 'jsonwebtoken';
import {LOCAL_STRATEGY_NAME} from '../auth/local.strategy';
import path from 'path';

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

const passwordSchema = {
  type: 'object',
  required: ['password'],
  properties: {
    password: {
      type: 'string',
      example: 'password',
      minLength: 8,
    },
  },
};

export class AuthController {
  constructor() {
  }

  private addJWTCookie(user: User, response: Response) {
    const jwtClaims = {
      sub: user.email,
      iss: JWT_ISS,
      aud: JWT_AUD,
      exp: Math.floor(Date.now() / 1000) + 604800,
      email: user.email,
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
      '200': {
        description: 'Credentials',
        content: {
          'application/json': {
            schema: CredentialsSchema,
          },
        },
      },
    },
  })
  @authenticate(LOCAL_STRATEGY_NAME)
  async login(
    @inject(AuthenticationBindings.CURRENT_USER) user: UserProfile,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    // TODO remove token return
    return this.addJWTCookie(user as User, response);
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
    @inject(AuthenticationBindings.CURRENT_USER)
      currentUserProfile: UserProfile,
  ): Promise<UserProfile> {
    return currentUserProfile;
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

  @authenticate(JWT_STRATEGY_NAME)
  @post('auth/setPassword', {
    responses: {
      '200': {
        description: 'Password',
        content: {
          'application/json': {
            schema: passwordSchema,
          },
        },
      },
    },
  })
  async setPassword(
    @requestBody({
      content: {
        'application/json': {
          schema: passwordSchema,
        },
      },
    })
      newPassword: {password: string},
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: User,
  ): Promise<string> {
    const password = await hash(newPassword.password, await genSalt());
    setUserPassword(currentUser.email, password);
    return currentUser.email;
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

  @authenticate(OPENID_STRATEGY_NAME)
  @get('/auth/openid/callback')
  async openIdConnectCallback(
    @inject(AuthenticationBindings.CURRENT_USER) user: UserProfile,
    @inject(RestBindings.Http.REQUEST) request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    return this.addJWTCookie(user as User, response);
  }
}
