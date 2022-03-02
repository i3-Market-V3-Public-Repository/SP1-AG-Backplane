/*
#  Copyright 2020-2022 i3-MARKET Consortium:
#
#  ATHENS UNIVERSITY OF ECONOMICS AND BUSINESS - RESEARCH CENTER
#  ATOS SPAIN SA
#  EUROPEAN DIGITAL SME ALLIANCE
#  GFT ITALIA SRL
#  GUARDTIME OU
#  HOP UBIQUITOUS SL
#  IBM RESEARCH GMBH
#  IDEMIA FRANCE
#  SIEMENS AKTIENGESELLSCHAFT
#  SIEMENS SRL
#  TELESTO TECHNOLOGIES PLIROFORIKIS KAI EPIKOINONION EPE
#  UNIVERSITAT POLITECNICA DE CATALUNYA
#  UNPARALLEL INNOVATION LDA
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#
*/

import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {get, Request, Response, RestBindings} from '@loopback/rest';
import {JWT_SECURITY_SCHEMA, JWT_STRATEGY_NAME} from '../auth/jwt.strategy';
import {OPENID_SECURITY_SCHEMA, OPENID_STRATEGY_NAME} from '../auth/open-id-connect.strategy';
import {BackplaneUserProfile} from '../auth/users';
import {User} from '../models';

export class AuthController {
  constructor() {
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

    //const token = this.getJWT(user);

    response.json({type: 'jwt', idToken: user.idToken, accessToken: user.accessToken});
  }
}