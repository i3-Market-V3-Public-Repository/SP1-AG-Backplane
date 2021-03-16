import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - FarewellRequestBody
 * FarewellRequestBody
 */
@model({name: 'FarewellRequestBody'})
export class FarewellRequestBody {
  constructor(data?: Partial<FarewellRequestBody>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   *
   */
  @property({jsonSchema: {
  type: 'string',
}})
  name?: string;

  /**
   *
   */
  @property({jsonSchema: {
  type: 'number',
}})
  age?: number;

}

export interface FarewellRequestBodyRelations {
  // describe navigational properties here
}

export type FarewellRequestBodyWithRelations = FarewellRequestBody & FarewellRequestBodyRelations;


