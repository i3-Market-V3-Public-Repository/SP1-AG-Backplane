import {BackplaneUserProfile, createUser, findById} from './users';
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
import {decode} from 'jsonwebtoken';
import {Client, Issuer} from 'openid-client';

export const OPENID_STRATEGY_NAME = 'openId';
export const OPENID_SECURITY_SCHEMA = {openId: []};


export class OpenIdConnectAuthenticationStrategy implements AuthenticationStrategy {
  name = OPENID_STRATEGY_NAME;

  constructor(
    private client: Client,
  ) {
  }

  async authenticate(request: Request): Promise<UserProfile | RedirectRoute | undefined> {
    if (request.path === '/auth/openid/login') {
      // Handle redirect to OpenId Provider
      return this.authenticateRedirect(request);
    } else {
      // Handle OpenId Provider callback
      return this.authenticateCallback(request);
    }
  }

  private authenticateRedirect(request: Request): RedirectRoute {
    const authUrl = this.client.authorizationUrl({
      scope: 'openid vc',
    });
    return new RedirectRoute(request.path, authUrl, 302);
  }

  private async authenticateCallback(request: Request): Promise<UserProfile | undefined> {
    const params = this.client.callbackParams(request);
    const tokenSet = await this.client.callback(this.client.metadata.redirect_uris![0], params);

    const data = decode(tokenSet.id_token!) as {[p: string]: unknown};
    let user = findById(data.sub as string);
    if (!user) {
      // TODO: Get real claims somehow
      const claims = Object.keys(tokenSet.claims());
      user = createUser(data.sub as string, claims, undefined);
    }
    return {id: user.id, claims: user.claims} as BackplaneUserProfile;
  }
}

export class OpenIdConnectProvider implements Provider<OpenIdConnectAuthenticationStrategy> {

  private strategy: OpenIdConnectAuthenticationStrategy;

  constructor(
    @inject('authentication.oidc.well-known-url') private wellKnownURL: string,
  ) {
  }

  async value(): Promise<OpenIdConnectAuthenticationStrategy> {
    if (!this.strategy) {
      const issuer = await Issuer.discover(this.wellKnownURL);
      const client = new issuer.Client({
          /* eslint-disable @typescript-eslint/naming-convention */
          client_id: 'AdhvMe7vu0ggyblApAH_z',
          client_secret: '7sbUuud7Tl907ySgIrIPG5x4re88JlSk6TyvaERq4lwZa9A9LoVkAtX4UEI26pfG49SZXrKS1bY6rn37bPr_CQ',
          redirect_uris: ['https://localhost:3000/auth/openid/callback'],
          application_type: 'web',
          grant_types: ['authorization_code'],
          response_types: ['code'],
          token_endpoint_auth_method: 'client_secret_jwt',
          id_token_signed_response_alg: 'EdDSA',
          /* eslint-enable @typescript-eslint/naming-convention */
        },
      );
      this.strategy = new OpenIdConnectAuthenticationStrategy(client);
      console.log('New strategy created');
    }
    return this.strategy;
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
