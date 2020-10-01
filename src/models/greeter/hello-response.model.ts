import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - HelloResponse
 * HelloResponse
 */
@model({name: 'HelloResponse'})
export class HelloResponse {
  constructor(data?: Partial<HelloResponse>) {
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

export interface HelloResponseRelations {
  // describe navigational properties here
}

export type HelloResponseWithRelations = HelloResponse & HelloResponseRelations;


