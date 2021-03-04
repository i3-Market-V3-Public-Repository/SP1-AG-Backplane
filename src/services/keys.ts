import {BindingKey, Provider} from '@loopback/core';
import {AuthenticationStrategyOptions} from '../auth/auth.options';
import {ClientMetadata} from 'openid-client';
import {AuthenticationStrategy} from '@loopback/authentication';


export namespace OpenIdConnectAuthenticationStrategyBindings {
  export const DEFAULT_OPTIONS = getAuthBindingKey('authentication.strategies.openId.defaultoptions');
  export const CLIENT_METADATA =
    BindingKey.create<ClientMetadata>('authentication.strategies.openId.clientmetadata');
  export const WELL_KNOWN_URL = 'authentication.oidc.well-known-url';
}

export namespace JWTAuthenticationStrategyBindings {
  export const DEFAULT_OPTIONS = getAuthBindingKey('authentication.strategies.jwt.defaultoptions');
  export const STRATEGY =
    BindingKey.create<Provider<AuthenticationStrategy>>('authentication.strategies.jwtAuthStrategy');
}

function getAuthBindingKey(key: string) {
  return BindingKey.create<AuthenticationStrategyOptions>(key);
}
