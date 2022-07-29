import {CustomError} from './CustomError';

export class AuthIssuerNotFoundError extends CustomError{
  constructor(wellKnownURL: string) {
    const hostname = new URL(wellKnownURL).hostname;
    const message = `The identity provider (${hostname}) is down or returned an invalid wellKnow info, please contact the administrator`;
    super(message, 503);
  }
}