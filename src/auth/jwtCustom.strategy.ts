import {AuthenticationStrategy} from '@loopback/authentication';
import {Request} from '@loopback/rest';
import {JWT_CUSTOM_STRATEGY_NAME} from './jwtCustom.provider';
import {securityId, UserProfile} from '@loopback/security';
import {
  FlattenedJWSInput,
  GetKeyFunction,
  JWSHeaderParameters, JWTPayload,
  JWTVerifyResult,

} from 'jose/dist/types/types';
import * as jose from 'jose'
import {JWTAuthStrategyProvider} from './jwt.strategy';
import {VerifiableCredential} from '../models';
import {decode} from 'jsonwebtoken';

export class JwtCustomAuthenticationStrategy implements AuthenticationStrategy {
  name = JWT_CUSTOM_STRATEGY_NAME;

  constructor(private jwks: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    console.log("Authenticate!!!");
    let resAccessToken;
    let resIdToken;
    let user;
    try {
      resAccessToken = await this.validateJWT(JWTAuthStrategyProvider.getJwt()(request) as string);
      resIdToken = await this.validateJWT(JWTAuthStrategyProvider.getIdToken()(request) as string);
      const claims = this.extractScope(resIdToken.payload);
      if (resAccessToken && resIdToken){
        user = {
          id: resIdToken.payload.sub,
          scope: claims,
          [securityId]: resIdToken.payload.sub
        };
      }
      return user as UserProfile;
    }catch (error){
      JwtCustomAuthenticationStrategy.processAuthenticationError(error);
    }
  }

  private static processAuthenticationError(error: Error){
    const err = new Error();
    Object.assign(err, {statusCode: 401, message: error.message})
    throw err;
  }

  private validateJWT(jwt: string): Promise<JWTVerifyResult> {
    return jose.jwtVerify(jwt,
      this.jwks,
      {
        issuer: 'https://identity4.i3-market.eu'
      });
  }

  private extractScope(data: JWTPayload): string {
    const verifiedClaims = data.verified_claims as {[p: string]: unknown};
    if (!verifiedClaims) return '';
    const claims: string[] = [];
    if (verifiedClaims.trusted) claims.push(...this.decodeAndValidateClaims(verifiedClaims.trusted as string[]));
    if (verifiedClaims.untrusted) claims.push(...this.decodeAndValidateClaims(verifiedClaims.untrusted as string[]));
    return claims.join(' ');
  }

  private decodeAndValidateClaims(vc: string[]): string[]{
    const claims: string[] = [];
    const decodeVC: VerifiableCredential[] = vc.map(v => ((decode(v) as {[p: string]: unknown}).vc as VerifiableCredential));
    decodeVC.forEach(v => {
      claims.push(...Object.keys(v.credentialSubject).filter(k => v.credentialSubject[k]))
    })
    return claims;
  }
}