import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {get, Request, Response, RestBindings} from '@loopback/rest';
import {JWT_SECURITY_SCHEMA, JWT_STRATEGY_NAME} from '../auth/jwt.strategy';
import {OPENID_SECURITY_SCHEMA, OPENID_STRATEGY_NAME} from '../auth/open-id-connect.strategy';
import {BackplaneUserProfile} from '../auth/users';
import {JWT_AUD, JWT_ISS} from '../auth/jwt.options';
import * as jwt from 'jsonwebtoken';
import {User} from '../models';

export class AuthController {
  constructor(@inject('config.rest.key') private key: string | Buffer,) {
  }

  private getJWT(user: BackplaneUserProfile) {
    const jwtClaims = {
      sub: user.id,
      iss: JWT_ISS,
      aud: JWT_AUD,
      exp: Math.floor(Date.now() / 1000) + 604800,
      scopes: user.scopes,
    };

    return jwt.sign(jwtClaims, this.key);
  }


  @authenticate(JWT_STRATEGY_NAME)
  @get('auth/whoAmI', {
    description: 'Endpoint to get the user profile of the logged in user',
    security: [
      JWT_SECURITY_SCHEMA,
    ],
    responses: {
      '200': {
        $ref: '#/components/schemas/User',
      },
    },
  })
  async whoAmI(
    @inject(AuthenticationBindings.CURRENT_USER)
      currentUserProfile: User,
  ): Promise<User> {
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
    const token = this.getJWT(user);
    response.json({type: 'jwt', token});
  }
}
