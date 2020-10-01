import {BindingKey} from '@loopback/core';

export interface AuthenticationStrategyOptions {
  [property: string]: any;
}

export namespace JWTAuthenticationStrategyBindings {
  export const DEFAULT_OPTIONS = BindingKey.create<AuthenticationStrategyOptions>('authentication.strategies.jwt.defaultoptions');
}

export const JWT_DEFAULT_OPTIONS = {session: false, failureRedirect: '/login'};
export const JWT_SECRET = 'secret';
export const JWT_ISS = 'https://localhost:3000';
export const JWT_AUD = 'https://localhost:3000';
export const JWT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: true,
};
