import {Getter, inject, Provider} from '@loopback/core';
import {AuthenticationBindings, AuthenticationMetadata, AuthenticationStrategy} from '@loopback/authentication';
import {JwtCustomAuthenticationStrategy} from './jwtCustom.strategy';
import {OpenIdConnectAuthenticationStrategyBindings} from '../services';
import {Issuer} from 'openid-client';

export const JWT_CUSTOM_STRATEGY_NAME = 'jwtCustom';
export const JWT_CUSTOM_SECURITY_SCHEMA = {jwtCustom: []};

export class JwtCustomAuthenticationStrategyProvider implements Provider<AuthenticationStrategy> {
  private strategy: JwtCustomAuthenticationStrategy;
  constructor(
    @inject(OpenIdConnectAuthenticationStrategyBindings.WELL_KNOWN_URL) private wellKnownURL: string,
    @inject.getter(AuthenticationBindings.METADATA)
    readonly getMetaData: Getter<AuthenticationMetadata>,
  ) {
  }
  async value(): Promise<AuthenticationStrategy> {
    if (!this.strategy) {
      const issuer = await Issuer.discover(this.wellKnownURL);
      this.strategy = new JwtCustomAuthenticationStrategy(issuer.metadata)
    }
    return this.strategy
  }
}