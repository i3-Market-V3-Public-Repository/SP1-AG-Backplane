import {Provider} from '@loopback/core';
import {AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer} from '@loopback/authorization';
import {BackplaneUserProfile} from './users';

export class AuthorizationProvider implements Provider<Authorizer> {
  /**
   * @returns an authorizer function
   *
   */
  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    context: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ) {
    const user = context.principals[0] as BackplaneUserProfile;
    const claims = metadata.scopes ?? [];
    for (const claim of claims) {
      if (!user.claims.includes(claim)) {
        return AuthorizationDecision.DENY;
      }
    }
    return AuthorizationDecision.ALLOW;
  }
}
