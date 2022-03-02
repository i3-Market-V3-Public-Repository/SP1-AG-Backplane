import {Model, model, property} from '@loopback/repository';

@model()
export class VerifiableCredential extends Model {
  @property()
  credentialSubject: {[p: string]: boolean};
  @property()
  '@context': string[];
  @property()
  type: string[];
  @property()
  credentialStatus: {id: string, type: string};
  @property()
  sub: string;
  @property()
  nbf: number;
  @property()
  iss: string;

  constructor(data?: Partial<VerifiableCredential>) {
    super(data);
  }
}