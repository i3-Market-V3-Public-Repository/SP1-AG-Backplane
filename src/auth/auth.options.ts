import {BindingKey} from "@loopback/core";

export interface AuthenticationStrategyOptions {
    [property: string]: unknown;
}

export namespace OpenIdConnectAuthenticationStrategyBindings {
    export const DEFAULT_OPTIONS = getAuthBindingKey('authentication.strategies.openId.defaultoptions');
    export const WELL_KNOWN_URL =
        BindingKey.create<string>('authentication.oidc.well-known-url');
}

export namespace JWTAuthenticationStrategyBindings {
    export const DEFAULT_OPTIONS = getAuthBindingKey('authentication.strategies.jwt.defaultoptions');
}

function getAuthBindingKey(key: string) {
    return BindingKey.create<AuthenticationStrategyOptions>(key);
}

export function getWellKnownUrl(){
    return `${process.env.PROVIDER_URI}/oidc/.well-known/openid-configuration`
}

