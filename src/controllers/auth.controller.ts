import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {get, post, Request, requestBody, Response, RestBindings, SchemaObject} from '@loopback/rest';
import {genSalt, hash} from 'bcryptjs';
import {JWT_SECURITY_SCHEMA, JWT_STRATEGY_NAME} from '../auth/jwt.strategy';
import {OPENID_SECURITY_SCHEMA, OPENID_STRATEGY_NAME} from '../auth/open-id-connect.strategy';
import {BackplaneUserProfile, createUser, setUserPassword} from '../auth/users';
import {JWT_AUD, JWT_ISS, JWT_SECRET} from '../auth/jwt.options';
import * as jwt from 'jsonwebtoken';
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
