import {BackplaneUserProfile, createUser, findById} from './users';
import {AuthenticationBindings, AuthenticationMetadata, AuthenticationStrategy} from '@loopback/authentication';
import {UserProfile} from '@loopback/security';
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
import {Client, Issuer} from 'openid-client';
import {AuthenticationStrategyOptions, OpenIdConnectAuthenticationStrategyBindings} from "./auth.options";
import {OPEN_ID_METADATA} from "./open-id-connect.options";

export const OPENID_STRATEGY_NAME = 'openId';
export const OPENID_SECURITY_SCHEMA = {openId: []};


export class OpenIdConnectAuthenticationStrategy implements AuthenticationStrategy {
  name = OPENID_STRATEGY_NAME;

  @inject(OpenIdConnectAuthenticationStrategyBindings.DEFAULT_OPTIONS)
  options: AuthenticationStrategyOptions;

  constructor(
    private client: Client,
    @inject.getter(AuthenticationBindings.METADATA)
    readonly getMetaData: Getter<AuthenticationMetadata>
  ) {
  }

  async authenticate(request: Request): Promise<UserProfile | RedirectRoute | undefined> {
    await this.processOptions();
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

  async processOptions() {
    /**
     Obtain the options object specified in the @authenticate decorator
     of a controller method associated with the current request.
     The AuthenticationMetadata interface contains : strategy:string, options?:object
     We want the options property.
     */
    const controllerMethodAuthenticationMetadata = await this.getMetaData();

    if (!this.options) this.options = {}; //if no default options were bound, assign empty options object

    //override default options with request-level options
    this.options = Object.assign(
        {},
        this.options,
        controllerMethodAuthenticationMetadata.options,
    );
  }
}

export class OpenIdConnectProvider implements Provider<OpenIdConnectAuthenticationStrategy> {

  private strategy: OpenIdConnectAuthenticationStrategy;

  constructor(
    @inject('authentication.oidc.well-known-url') private wellKnownURL: string,
    @inject.getter(AuthenticationBindings.METADATA)
    readonly getMetaData: Getter<AuthenticationMetadata>,
  ) {
  }

  async value(): Promise<OpenIdConnectAuthenticationStrategy> {
    if (!this.strategy) {
      const issuer = await Issuer.discover(this.wellKnownURL);
      const client = new issuer.Client(OPEN_ID_METADATA,
      );
      this.strategy = new OpenIdConnectAuthenticationStrategy(client, this.getMetaData);
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
