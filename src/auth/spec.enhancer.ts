import {injectable} from '@loopback/core';
import {asSpecEnhancer, mergeSecuritySchemeToSpec, OASEnhancer, OpenApiSpec} from '@loopback/rest';

/**
 * A spec enhancer to add OpenAPI info spec
 */
@injectable(asSpecEnhancer)
export class AuthSpecEnhancer implements OASEnhancer {
  // give your enhancer a proper name
  name = 'info';

  // takes in the current spec, modifies it, and returns a new one
  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    return mergeSecuritySchemeToSpec(spec, this.name, {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    });
  }
}
