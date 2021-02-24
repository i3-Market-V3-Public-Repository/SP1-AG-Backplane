import {BindingKey} from "@loopback/core";
import {AuthenticationStrategyOptions} from "../auth/auth.options";
import {StrategyAdapter} from "@loopback/authentication-passport";


export namespace OpenIdConnectAuthenticationStrategyBindings {
    export const DEFAULT_OPTIONS = getAuthBindingKey('authentication.strategies.openId.defaultoptions');
    export const WELL_KNOWN_URL =
        BindingKey.create<string>('authentication.oidc.well-known-url');
}

export namespace JWTAuthenticationStrategyBindings {
    export const DEFAULT_OPTIONS = getAuthBindingKey('authentication.strategies.jwt.defaultoptions');
    export const STRATEGY =
        BindingKey.create<StrategyAdapter<unknown>>('authentication.strategies.jwtAuthStrategy');
}

function getAuthBindingKey(key: string) {
    return BindingKey.create<AuthenticationStrategyOptions>(key);
}