import {Model, model, property} from '@loopback/repository';

@model()
export class IdToken extends Model {
  @property()
  sub: string;
  @property()
    // eslint-disable-next-line @typescript-eslint/naming-convention
  verified_claims: {trusted: string[], untrusted: string[]};
  @property()
    // eslint-disable-next-line @typescript-eslint/naming-convention
  at_hash: string;
  @property()
  aud: string;
  @property()
  exp: number;
  @property()
  iat: number;
  @property()
  iss: string;

  constructor(data?: Partial<IdToken>) {
    super(data);
  }
}