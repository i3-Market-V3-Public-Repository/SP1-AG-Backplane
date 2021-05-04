import {ExtractJwt, Strategy, VerifiedCallback} from 'passport-jwt';
import {findById} from './users';
import {StrategyAdapter} from '@loopback/authentication-passport';
import {injectable, inject, Provider} from '@loopback/core';
import {asSpecEnhancer, mergeSecuritySchemeToSpec, OASEnhancer, OpenApiSpec} from '@loopback/rest';
import {AuthenticationStrategy} from '@loopback/authentication';

interface Payload {
  sub: string;
}

export const JWT_STRATEGY_NAME = 'jwt';
export const JWT_SECURITY_SCHEMA = {jwt: []};

export class JWTAuthStrategyProvider implements Provider<AuthenticationStrategy> {
  constructor(
    @inject('config.jwt.key') private key: string | Buffer,
  ) {
  }

  verify(payload: Payload, done: VerifiedCallback) {
    const user = findById(payload.sub);
    if (user) {
      console.log(`jwt for user ${payload.sub} verified and the user is in the db`);
      return done(null, user);
    }
    console.log(`jwt for user ${payload.sub} verified but the user is NOT in the db`);
    return done(null, false);
  }

  value(): AuthenticationStrategy {
    const jwtStrategy = new Strategy({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: this.key,
    }, this.verify);
    return new StrategyAdapter(jwtStrategy, JWT_STRATEGY_NAME);
  }
}

@injectable(asSpecEnhancer)
export class JWTSpecEnhancer implements OASEnhancer {
  name = JWT_STRATEGY_NAME;

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    return mergeSecuritySchemeToSpec(spec, this.name, {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    });
  }
}
