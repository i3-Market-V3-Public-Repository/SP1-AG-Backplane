import {BackplaneUserProfile, createUser, findByEmail} from './users';
import {AuthenticationStrategy} from '@loopback/authentication';
import {UserProfile} from '@loopback/security';
import {
  asSpecEnhancer,
  mergeSecuritySchemeToSpec,
  OASEnhancer,
  OpenApiSpec,
  RedirectRoute,
  Request,
} from '@loopback/rest';
import {inject, injectable, Provider} from '@loopback/core';
import {AxiosResponse, default as axios} from 'axios';
import {decode} from 'jsonwebtoken';

export const OPENID_STRATEGY_NAME = 'openId';
export const OPENID_SECURITY_SCHEMA = {openId: []};

// OpenId configuration
const CLIENT_ID = 'Backplane';
const CALLBACK_URI = 'https://localhost:3000/auth/openid/callback';
const RESPONSE_TYPE = 'code';
const SCOPE = 'openid roles';


export class OpenIdConnectAuthenticationStrategy implements AuthenticationStrategy {
  name = OPENID_STRATEGY_NAME;

  constructor(
    private clientId: string,
    private tokenEndpoint: string,
    private redirectUrl: string,
    private callbackUri: string,
  ) {
  }

  async authenticate(request: Request): Promise<UserProfile | RedirectRoute | undefined> {
    if (request.path === '/auth/openid/login') {
      // Handle redirect to OpenId Provider
      return new RedirectRoute(request.path, this.redirectUrl, 302);
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

  private async getToken(authCode: string) {
    const tokenData = `code=${authCode}&grant_type=authorization_code&redirect_uri=${this.callbackUri}&client_id=${this.clientId}`;
    const tokenResponse = await axios.post(this.tokenEndpoint, tokenData, {
      headers: {'content-type': 'application/x-www-form-urlencoded'},
    });
    return tokenResponse.data;
  }
}

export class OpenIdConnectProvider implements Provider<OpenIdConnectAuthenticationStrategy> {
  private cachedResponses: Map<string, AxiosResponse> = new Map();

  constructor(
    @inject('authentication.oidc.well-known-url') private wellKnownURL: string,
  ) {
  }

  async value(): Promise<OpenIdConnectAuthenticationStrategy> {
    console.log('New strategy created');
    const response = this.cachedResponses.has(this.wellKnownURL) ? this.cachedResponses.get(this.wellKnownURL)! : await axios.get(this.wellKnownURL);
    const redirectUrl = `${response.data['authorization_endpoint']}?response_type=${RESPONSE_TYPE}&scope=${SCOPE}&client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URI}`;
    return new OpenIdConnectAuthenticationStrategy('Backplane', response.data['token_endpoint'], redirectUrl, CALLBACK_URI);
  }
}

@injectable(asSpecEnhancer)
export class OpenIdSpecEnhancer implements OASEnhancer {
  name = OPENID_STRATEGY_NAME;

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    return mergeSecuritySchemeToSpec(spec, this.name, {
      type: 'openIdConnect',
    });
  }
}
