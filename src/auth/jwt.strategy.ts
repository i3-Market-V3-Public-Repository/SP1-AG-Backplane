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

import {ExtractJwt, JwtFromRequestFunction, Strategy, VerifiedCallback} from 'passport-jwt';
import {findById} from './users';
import {StrategyAdapter} from '@loopback/authentication-passport';
import {injectable, inject, Provider} from '@loopback/core';
import {asSpecEnhancer, mergeSecuritySchemeToSpec, OASEnhancer, OpenApiSpec} from '@loopback/rest';
import {AuthenticationStrategy} from '@loopback/authentication';
import {Request} from 'express';
import {IdToken} from '../models/idToken.model';
import {decode} from 'jsonwebtoken';
import {VerifiableCredential} from '../models/verifiableCredential.model';
import {User} from '../models';

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

  //TODO verify credentials against VC Service
  verify(req: Request, payload: Payload, done: VerifiedCallback) {
    const idToken = decode(<string>JWTAuthStrategyProvider.getIdToken()(req)) as unknown as IdToken;
    const user = new User({
      id: payload.sub,
      scope: JWTAuthStrategyProvider.extractScope(idToken),
    });
    //TODO SEND request to VC Verify
    return done(null, user)
    if (user) {
      console.log(`jwt for user ${payload.sub} verified and the user is in the db`);
      return done(null, user);
    }
    console.log(`jwt for user ${payload.sub} verified but the user is NOT in the db`);
    return done(null, false);
  }

   static extractScope(data: IdToken): string {
    const verifiedClaims = data.verified_claims as {[p: string]: unknown};
    if (!verifiedClaims) return '';
    const claims: string[] = [];
    if (verifiedClaims.trusted) claims.push(...this.decodeAndValidateClaims(verifiedClaims.trusted as string[]));
    if (verifiedClaims.untrusted) claims.push(...this.decodeAndValidateClaims(verifiedClaims.untrusted as string[]));
    return claims.join(' ');
  }

  static decodeAndValidateClaims(vc: string[]): string[]{
    const claims: string[] = [];
    const decodeVC: VerifiableCredential[] = vc.map(v => ((decode(v) as {[p: string]: unknown}).vc as VerifiableCredential));
    decodeVC.forEach(v => {
      //TODO Verify V against VC service and check validity
      claims.push(...Object.keys(v.credentialSubject).filter(k => v.credentialSubject[k]))
    })
    return claims;
  }

  value(): AuthenticationStrategy {
    const jwtStrategy = new Strategy({
      jwtFromRequest: JWTAuthStrategyProvider.getJwt(),
      passReqToCallback: true,
      secretOrKey: this.key,
    }, this.verify);
    return new StrategyAdapter(jwtStrategy, JWT_STRATEGY_NAME);
  }

  static getJwt(): JwtFromRequestFunction{
    return ExtractJwt.fromHeader('access_token');
  }

  static getIdToken(): JwtFromRequestFunction{
    return ExtractJwt.fromHeader('id_token');
  }
}

@injectable(asSpecEnhancer)
export class JWTSpecEnhancer implements OASEnhancer {
  name = JWT_STRATEGY_NAME;

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    const modifiedSpec = mergeSecuritySchemeToSpec(spec, this.name, {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    });

    modifiedSpec.components!.securitySchemes![this.name] = {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    };
    return modifiedSpec;
  }
}