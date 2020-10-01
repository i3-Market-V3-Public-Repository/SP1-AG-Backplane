import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - ByeResponse
 * ByeResponse
 */
@model({name: 'ByeResponse'})
export class ByeResponse {
  constructor(data?: Partial<ByeResponse>) {
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
  greeting?: string;

  /**
   *
   */
  @property({jsonSchema: {
  type: 'number',
}})
  random?: number;

}

export interface ByeResponseRelations {
  // describe navigational properties here
}

export type ByeResponseWithRelations = ByeResponse & ByeResponseRelations;


