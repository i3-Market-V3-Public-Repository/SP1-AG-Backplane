import {Strategy, VerifiedCallback} from 'passport-jwt';
import {Request} from 'express';
import {findByEmail} from './users';
import {StrategyAdapter} from '@loopback/authentication-passport';
import {JWT_SECRET} from './jwt.options';
import {injectable} from '@loopback/core';
import {asSpecEnhancer, mergeSecuritySchemeToSpec, OASEnhancer, OpenApiSpec} from '@loopback/rest';

interface Payload {
  sub: string;
}

function verify(payload: Payload, done: VerifiedCallback) {
  const user = findByEmail(payload.sub);
  if (user) {
    console.log(`jwt for user ${payload.sub} verified and the user is in the db`);
    return done(null, user);
  }
  console.log(`jwt for user ${payload.sub} verified but the user is NOT in the db`);
  return done(null, false);
}

function jwtCookieExtractor(request: Request): string | null {
  return request?.cookies?.jwt ?? null;
}

const jwtStrategy = new Strategy({jwtFromRequest: jwtCookieExtractor, secretOrKey: JWT_SECRET}, verify);

export const JWT_STRATEGY_NAME = 'jwt';
export const JWT_SECURITY_SCHEMA = {jwt: []};
export const jwtAuthStrategy = new StrategyAdapter(jwtStrategy, JWT_STRATEGY_NAME);

@injectable(asSpecEnhancer)
export class JWTSpecEnhancer implements OASEnhancer {
  name = JWT_STRATEGY_NAME;

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    return mergeSecuritySchemeToSpec(spec, this.name, {
      type: 'apiKey',
      in: 'cookie',
      name: 'jwt',
    });
  }
}