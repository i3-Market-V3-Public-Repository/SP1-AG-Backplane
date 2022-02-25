import {Getter, inject, Provider} from '@loopback/core';
import {AuthenticationBindings, AuthenticationMetadata, AuthenticationStrategy} from '@loopback/authentication';
import {JwtCustomAuthenticationStrategy} from './jwtCustom.strategy';
import * as jose from 'jose'

export const JWT_CUSTOM_STRATEGY_NAME = 'jwtCustom';
export const JWT_CUSTOM_SECURITY_SCHEMA = {jwtCustom: []};

export class JwtCustomAuthenticationStrategyProvider implements Provider<AuthenticationStrategy> {
  private strategy: JwtCustomAuthenticationStrategy;
  constructor(
    @inject.getter(AuthenticationBindings.METADATA)
    readonly getMetaData: Getter<AuthenticationMetadata>,
  ) {
  }
  async value(): Promise<AuthenticationStrategy> {
    if (!this.strategy) {
      const jwks = jose.createRemoteJWKSet(new URL('https://identity4.i3-market.eu/release2/oidc/jwks'))
      this.strategy = new JwtCustomAuthenticationStrategy(jwks)
    }
    return this.strategy
  }
}