import {Model, model, property} from '@loopback/repository';

@model({
  name: 'NewUserRequest',
  jsonSchema: {
    title: 'New user request',
  },
})
export class NewUserRequest extends Model {
  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      format: 'email',
      example: 'email@example.com',
    },
  })
  email: string;

  @property({
    type: 'string',
    jsonSchema: {
      format: 'password',
      example: 'password123',
    },
  })
  password: string;
}

@model()
export class User extends Model {
  @property({
    type: 'string',
    required: true,
    jsonSchema: {
    },
  })
  id: string;

  @property({
    type: 'scope',
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
