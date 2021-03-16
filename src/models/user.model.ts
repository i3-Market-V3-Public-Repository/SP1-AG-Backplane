import {Model, model, property} from '@loopback/repository';

@model()
export class User extends Model {
  @property({
    type: 'string',
    required: true,
    jsonSchema: {},
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  scope: string;


  constructor(data?: Partial<User>) {
    super(data);
    if (!this.scope) {
      this.scope = '';
    }
  }
}
