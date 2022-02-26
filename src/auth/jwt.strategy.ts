import {AuthenticationBindings, AuthenticationMetadata, AuthenticationStrategy} from '@loopback/authentication';
import {asSpecEnhancer, mergeSecuritySchemeToSpec, OASEnhancer, OpenApiSpec, Request} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {
  FlattenedJWSInput,
  GetKeyFunction,
  JWSHeaderParameters, JWTPayload,
  JWTVerifyResult,
} from 'jose/dist/types/types';
import * as jose from 'jose'
import {VerifiableCredential} from '../models';
import {decode} from 'jsonwebtoken';
import {Issuer, IssuerMetadata} from 'openid-client';
import {Getter, inject, injectable, Provider} from '@loopback/core';
import {ExtractJwt, JwtFromRequestFunction} from 'passport-jwt';
import {OpenIdConnectAuthenticationStrategyBindings} from '../services';


export const JWT_STRATEGY_NAME = 'jwt';
export const JWT_SECURITY_SCHEMA = {jwt: []};

export class JwtAuthenticationStrategyProvider implements Provider<AuthenticationStrategy> {
  private strategy: JwtAuthenticationStrategy;
  constructor(
    @inject(OpenIdConnectAuthenticationStrategyBindings.WELL_KNOWN_URL) private wellKnownURL: string,
    @inject.getter(AuthenticationBindings.METADATA)
    readonly getMetaData: Getter<AuthenticationMetadata>,
  ) {
  }
  async value(): Promise<AuthenticationStrategy> {
    if (!this.strategy) {
      const issuer = await Issuer.discover(this.wellKnownURL);
      this.strategy = new JwtAuthenticationStrategy(issuer.metadata)
    }
    return this.strategy
  }
}

export class JwtAuthenticationStrategy implements AuthenticationStrategy {
  name = JWT_STRATEGY_NAME;
  jwks: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput>;

  constructor(private issuerMetadata: IssuerMetadata) {
    this.jwks = jose.createRemoteJWKSet(new URL(issuerMetadata.jwks_uri as string))
  }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    let resAccessToken;
    let resIdToken;
    let user;
    try { //check Access_Token
      resAccessToken = await this.validateJWT(JwtAuthenticationStrategy.getJwt()(request) as string);
    }catch (error){
      JwtAuthenticationStrategy.processAuthenticationError('access_token', error);
    }
    try { //check Id_Token
      resIdToken = await this.validateJWT(JwtAuthenticationStrategy.getIdToken()(request) as string);
    }catch (error){
      JwtAuthenticationStrategy.processAuthenticationError('id_token', error);
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

  private static getJwt(): JwtFromRequestFunction{
    return ExtractJwt.fromHeader('access_token');
  }

  private static getIdToken(): JwtFromRequestFunction{
    return ExtractJwt.fromHeader('id_token');
  }
}

@injectable(asSpecEnhancer)
export class JWTSpecEnhancer implements OASEnhancer {
  name = JWT_STRATEGY_NAME;

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    const modifiedSpec = mergeSecuritySchemeToSpec(spec, this.name, {
      type: 'http',
      bearerFormat: 'JWT',
    });

    modifiedSpec.components!.securitySchemes![this.name] = {
      type: 'http',
      bearerFormat: 'JWT',
    };
    return modifiedSpec;
  }
}