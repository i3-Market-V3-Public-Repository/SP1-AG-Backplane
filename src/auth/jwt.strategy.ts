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
import {decode} from 'jsonwebtoken';
import {Issuer, IssuerMetadata} from 'openid-client';
import {Getter, inject, injectable, Provider} from '@loopback/core';
import {ExtractJwt, JwtFromRequestFunction} from 'passport-jwt';
import {OpenIdConnectAuthenticationStrategyBindings} from '../services';
import {VerifiableCredential} from '../models/verifiableCredential.model';
import {SecurityRequirementObject} from 'openapi3-ts/src/model/OpenApi';


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
      const accessToken = JwtAuthenticationStrategy.retrieveAccessToken(request);
      resAccessToken = await this.validateJWT(accessToken);
    }catch (error){
      JwtAuthenticationStrategy.processAuthenticationError('access_token', error);
    }
    try { //check Id_Token
      const idToken = JwtAuthenticationStrategy.retrieveIdToken(request);
      resIdToken = await this.validateJWT(idToken);
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
  private static retrieveAccessToken(request: Request) {
    const accessToken = JwtAuthenticationStrategy.getJwt()(request) as string
    if (accessToken == null || accessToken.length === 0){
      throw new Error("Authenticated endpoint - Missing Access Token (header access_token)")
    }
    return accessToken
  }

  private static retrieveIdToken(request: Request) {
    const idToken = JwtAuthenticationStrategy.getIdToken()(request) as string
    if (idToken == null || idToken.length === 0){
      throw new Error("Authenticated endpoint - Missing Id Token (header id_token)")
    }
    return idToken
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
    let modifiedSpec = mergeSecuritySchemeToSpec(spec, this.name, {
      type: 'apiKey',
      in: 'header',
      name: 'id_token'
    });

    modifiedSpec = mergeSecuritySchemeToSpec(modifiedSpec, "jwtAccess", {
      type: 'apiKey',
      in: 'header',
      name: 'access_token'
    });



    //Iterate over all paths and add the security schema (access token)
    //this Could also be directly defined in the OAS files
    Object.keys(modifiedSpec.paths).forEach((pathGroupKey) => {
      for (const operationId in modifiedSpec.paths[pathGroupKey]) {
        const operationDef = modifiedSpec.paths[pathGroupKey][operationId]
        if (operationDef.security?.some((obj: SecurityRequirementObject) => {return JWT_STRATEGY_NAME in obj})) {
          operationDef.security.push({jwtAccess: []})
        }
      }
    });
    return modifiedSpec;
  }
}