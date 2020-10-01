import {injectable} from '@loopback/core';
import {asSpecEnhancer, mergeSecuritySchemeToSpec, OASEnhancer, OpenApiSpec} from '@loopback/rest';

/**
 * A spec enhancer to add OpenAPI info spec
 */
@injectable(asSpecEnhancer)
export class LocalSpecEnhancer implements OASEnhancer {
  name = 'local';

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    return mergeSecuritySchemeToSpec(spec, this.name, {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    });
  }
}
@injectable(asSpecEnhancer)
export class JWTSpecEnhancer implements OASEnhancer {
  name = 'jwtCookie';

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    return mergeSecuritySchemeToSpec(spec, this.name, {
      type: 'http',
      in: 'cookie',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    });
  }
}
