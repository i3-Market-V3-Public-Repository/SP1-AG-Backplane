import {CustomError} from './CustomError';

export class AuthIssuerNotFoundError extends CustomError{
  constructor(wellKnownURL: string) {
    let message;
    try {
      const hostname = new URL(wellKnownURL).hostname;
      message = `The identity provider (${hostname}) is down or returned an invalid well-Know info, please contact the administrator`;
    }catch (e) {
      message = `Invalid identity provider well-Known URL (${wellKnownURL}), please contact the administrator`
    }
    super(message, 503);
  }
}