import {BackplaneUserProfile, createUser, findById} from './users';
import {AuthenticationBindings, AuthenticationMetadata, AuthenticationStrategy} from '@loopback/authentication';
import {
  asSpecEnhancer,
  mergeSecuritySchemeToSpec,
  OASEnhancer,
  OpenApiSpec,
  RedirectRoute,
  Request,
} from '@loopback/rest';
import {Getter, inject, injectable, Provider} from '@loopback/core';
import {decode} from 'jsonwebtoken';
import {Client, ClientMetadata, Issuer} from 'openid-client';
import {OpenIdConnectAuthenticationStrategyBindings} from '../services';
import {AuthenticationStrategyOptions} from './auth.options';

export const OPENID_STRATEGY_NAME = 'openIdConnect';
export const OPENID_SECURITY_SCHEMA = {openIdConnect: []};

export class OpenIdConnectAuthenticationStrategy implements AuthenticationStrategy {
  name = OPENID_STRATEGY_NAME;

  @inject(OpenIdConnectAuthenticationStrategyBindings.DEFAULT_OPTIONS)
  options: AuthenticationStrategyOptions;

  constructor(
    private client: Client,
    @inject.getter(AuthenticationBindings.METADATA)
    readonly getMetaData: Getter<AuthenticationMetadata>,
  ) {
  }

  async authenticate(request: Request): Promise<BackplaneUserProfile | RedirectRoute | undefined> {
    await this.processOptions();
    console.log('Test');
    console.log(this.options.isLoginEndpoint);
    if (this.options.isLoginEndpoint) {
      // Handle redirect to OpenId Provider
      return this.authenticateRedirect(request);
    } else {
      // Handle OpenId Provider callback
      return this.authenticateCallback(request);
    }
  }

  private authenticateRedirect(request: Request): RedirectRoute {
    const authUrl = this.client.authorizationUrl({
      scope: this.client.metadata.scope as string,
    });
    return new RedirectRoute(request.path, authUrl, 302);
  }

  private async authenticateCallback(request: Request): Promise<BackplaneUserProfile | undefined> {
    const params = this.client.callbackParams(request);
    const tokenSet = await this.client.callback(this.client.metadata.redirect_uris![0], params);

    const data = decode(tokenSet.id_token!) as {[p: string]: unknown};
    let user = findById(data.sub as string);
    if (!user) {
      const scope = this.extractScope(data);
      user = createUser(data.sub as string, scope);
    }
    return {id: user.id, scope: user.scope} as BackplaneUserProfile;
  }

  private extractScope(data: {[p: string]: unknown}): string {
    const verifiedClaims = data.verified_claims as {[p: string]: unknown};
    if (!verifiedClaims) return '';
    const claims: string[] = [];
    const userClaims: {[p: string]: unknown}[] = [];
    if (verifiedClaims.trusted) userClaims.push(...(verifiedClaims.trusted as {[p: string]: unknown}[]));
    if (verifiedClaims.untrusted) userClaims.push(...(verifiedClaims.untrusted as {[p: string]: unknown}[]));
    for (const claim of userClaims) {
      const subclaim = claim.claim as {[p: string]: boolean};
      for (const key in subclaim) {
        if (subclaim[key]) {
          claims.push(key);
        }
      }
    }
    return claims.join(' ');
  }

  async processOptions() {
    /**
     Obtain the options object specified in the @authenticate decorator
     of a controller method associated with the current request.
     The AuthenticationMetadata interface contains : strategy:string, options?:object
     We want the options property.
     */
    const controllerMethodAuthenticationMetadata = await this.getMetaData() as unknown as Array<AuthenticationMetadata>;

    if (!this.options) this.options = {}; //if no default options were bound, assign empty options object

    //override default options with request-level options
    this.options = Object.assign(
      {},
      this.options,
      controllerMethodAuthenticationMetadata[0].options,
    );
  }
}

export class OpenIdConnectProvider implements Provider<OpenIdConnectAuthenticationStrategy> {

  private strategy: OpenIdConnectAuthenticationStrategy;

  constructor(
    @inject(OpenIdConnectAuthenticationStrategyBindings.WELL_KNOWN_URL) private wellKnownURL: string,
    @inject(OpenIdConnectAuthenticationStrategyBindings.CLIENT_METADATA) private openIdMetadata: ClientMetadata,
    @inject.getter(AuthenticationBindings.METADATA)
    readonly getMetaData: Getter<AuthenticationMetadata>,
  ) {
  }

  async value(): Promise<OpenIdConnectAuthenticationStrategy> {
    if (!this.strategy) {
      const issuer = await Issuer.discover(this.wellKnownURL);
      const client = new issuer.Client(this.openIdMetadata);
      this.strategy = new OpenIdConnectAuthenticationStrategy(client, this.getMetaData);
    }
    return this.strategy;
  }
}

@injectable(asSpecEnhancer)
export class OpenIdSpecEnhancer implements OASEnhancer {
  name = OPENID_STRATEGY_NAME;

  constructor(@inject('authentication.oidc.well-known-url') private url: string) {
  }

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    const modifiedSpec = mergeSecuritySchemeToSpec(spec, this.name, {
      type: 'openIdConnect',
      openIdConnectUrl: this.url,
    });
    modifiedSpec.components!.securitySchemes![this.name] = {
      type: 'openIdConnect',
      openIdConnectUrl: this.url,
    };
    return modifiedSpec;
  }
}
