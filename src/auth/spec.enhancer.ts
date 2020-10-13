import {injectable} from '@loopback/core';
import {asSpecEnhancer, mergeSecuritySchemeToSpec, OASEnhancer, OpenApiSpec} from '@loopback/rest';

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
      type: 'apiKey',
      in: 'cookie',
      name: 'jwt',
    });
  }
}
