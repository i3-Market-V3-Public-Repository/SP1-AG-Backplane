import {BackplaneUserProfile, createUser, findByEmail} from './users';
import {asAuthStrategy, AuthenticationStrategy} from '@loopback/authentication';
import {UserProfile} from '@loopback/security';
import {
  asSpecEnhancer,
  mergeSecuritySchemeToSpec,
  OASEnhancer,
  OpenApiSpec,
  RedirectRoute,
  Request,
} from '@loopback/rest';
import {injectable} from '@loopback/core';
import {default as axios} from 'axios';
import {decode} from 'jsonwebtoken';

export const OPENID_STRATEGY_NAME = 'openId';
export const OPENID_SECURITY_SCHEMA = {openId: []};

const BASE_URL = 'https://localhost:8080';
const AUTHORIZATION_ENDPOINT = BASE_URL + '/auth/realms/i3-Market/protocol/openid-connect/auth';
const TOKEN_ENDPOINT = BASE_URL + '/auth/realms/i3-Market/protocol/openid-connect/token';
const CLIENT_ID = 'Backplane';
const REDIRECT_URI = 'https://localhost:3000/auth/openid/callback';
const RESPONSE_TYPE = 'code';
const SCOPE = 'openid roles';

const REDIRECT_URL = `${AUTHORIZATION_ENDPOINT}?response_type=${RESPONSE_TYPE}&scope=${SCOPE}&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;

@injectable(asAuthStrategy, asSpecEnhancer)
export class OpenIdConnectAuthenticationStrategy implements AuthenticationStrategy, OASEnhancer {
  name = OPENID_STRATEGY_NAME;

  constructor() {
  }

  async authenticate(request: Request): Promise<UserProfile | RedirectRoute | undefined> {
    if (request.path === '/auth/openid/login') {
      // Handle redirect to OpenId Provider
      return new RedirectRoute(request.path, REDIRECT_URL, 302);
    } else {
      // Handle OpenId Provider callback
      const authCode = this.extractAuthCode(request);
      if (!authCode) return undefined;
      const tokens = await this.getToken(authCode);
      const data = this.extractData(tokens.access_token);
      if (!data.email) {
        return undefined;
      }
      let user = findByEmail(data.email);
      if (!user) {
        user = createUser(data.email, undefined, data.scopes);
      }
      // else {
      //   user = updateUser(data.email, data.scopes ?? []);
      // }
      return {email: user.email, scopes: user.scopes} as BackplaneUserProfile;
    }
  }

  extractData(token: string): {email?: string, scopes?: string[]} {
    const decoded = decode(token) as {[key: string]: unknown};
    return {
      email: decoded?.['email'] as string,
      scopes: (decoded?.['realm_access'] as {[key: string]: unknown})?.['roles'] as string[],
    };
  }


  extractAuthCode(request: Request): string | undefined {
    const params = request.url.replace(request.baseUrl + '?', '').split('&');
    for (const param of params) {
      if (param.startsWith('code')) {
        return param.substr(5);
      }
    }
    return undefined;
  }

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    return mergeSecuritySchemeToSpec(spec, this.name, {
      type: 'openIdConnect',
    });
  }

  private async getToken(authCode: string) {
    const tokenData = `code=${authCode}&grant_type=authorization_code&redirect_uri=${REDIRECT_URI}&client_id=${CLIENT_ID}`;
    const tokenResponse = await axios.post(TOKEN_ENDPOINT, tokenData, {
      headers: {'content-type': 'application/x-www-form-urlencoded'},
    });
    return tokenResponse.data;
  }
}