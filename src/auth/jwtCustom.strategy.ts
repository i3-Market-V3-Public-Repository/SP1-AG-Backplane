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
import {IssuerMetadata} from 'openid-client';

export class JwtCustomAuthenticationStrategy implements AuthenticationStrategy {
  name = JWT_CUSTOM_STRATEGY_NAME;
  jwks: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>;

  constructor(private issuerMetadata: IssuerMetadata) {
    this.jwks = jose.createRemoteJWKSet(new URL(issuerMetadata.jwks_uri as string))
  }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    console.log("Authenticate!!!");
    let resAccessToken;
    let resIdToken;
    let user;
    try { //check Access_Token
      resAccessToken = await this.validateJWT(JWTAuthStrategyProvider.getJwt()(request) as string);
    }catch (error){
      JwtCustomAuthenticationStrategy.processAuthenticationError('access_token', error);
    }
    try { //check Id_Token
      resIdToken = await this.validateJWT(JWTAuthStrategyProvider.getIdToken()(request) as string);
    }catch (error){
      JwtCustomAuthenticationStrategy.processAuthenticationError('id_token', error);
    }
    if (resAccessToken && resIdToken){
      const claims = this.extractScope(resIdToken.payload);
      user = {
        id: resIdToken.payload.sub,
        scope: claims,
        [securityId]: resIdToken.payload.sub
      };
    }
    return user as UserProfile;
  }

  private static processAuthenticationError(type: string, error: Error){
    const err = new Error();
    Object.assign(err, {statusCode: 401, message: type + ': ' + error.message})
    throw err;
  }

  private validateJWT(jwt: string): Promise<JWTVerifyResult> {
    return jose.jwtVerify(jwt,
      this.jwks,
      {
        issuer: this.issuerMetadata.issuer
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