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
import {IdToken} from '../models/idToken.model';

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

    const data = decode(tokenSet.id_token!) as IdToken; //TODO delete, openIdStrategy is not used
    return {id: data.sub} as BackplaneUserProfile;
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