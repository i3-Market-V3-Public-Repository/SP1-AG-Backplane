import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - FarewellResponse
 * FarewellResponse
 */
@model({name: 'FarewellResponse'})
export class FarewellResponse {
  constructor(data?: Partial<FarewellResponse>) {
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
  farewell?: string;

  /**
   *
   */
  @property({jsonSchema: {
  type: 'string',
}})
  date?: string;

  /**
   *
   */
  @property({jsonSchema: {
  type: 'string',
}})
  url?: string;

}

export interface FarewellResponseRelations {
  // describe navigational properties here
}

export type FarewellResponseWithRelations = FarewellResponse & FarewellResponseRelations;


