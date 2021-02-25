import {ExtractJwt, Strategy, VerifiedCallback} from 'passport-jwt';
import {findById} from './users';
import {StrategyAdapter} from '@loopback/authentication-passport';
import {JWT_SECRET} from './jwt.options';
import {injectable} from '@loopback/core';
import {asSpecEnhancer, mergeSecuritySchemeToSpec, OASEnhancer, OpenApiSpec} from '@loopback/rest';

interface Payload {
  sub: string;
}

function verify(payload: Payload, done: VerifiedCallback) {
  const user = findById(payload.sub);
  if (user) {
    console.log(`jwt for user ${payload.sub} verified and the user is in the db`);
    return done(null, user);
  }
  console.log(`jwt for user ${payload.sub} verified but the user is NOT in the db`);
  return done(null, false);
}

const jwtStrategy = new Strategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
}, verify);

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
