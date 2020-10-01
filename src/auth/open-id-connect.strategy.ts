// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, Issuer, Strategy, TokenSet, UserinfoResponse} from 'openid-client';
import {StrategyAdapter} from '@loopback/authentication-passport';
import {createUser, findByEmail, User} from './users';

function verify(tokenSet: TokenSet, userinfo: UserinfoResponse, done: (err: any, user?: User) => void) {
  const claims = tokenSet.claims();
  if (!claims.email) {
    return done('Missing email');
  }
  let user = findByEmail(claims.name!);
  if (!user) {
    user = createUser(claims.email!, undefined);
  }
  return done(null, user);
}

export const OPENID_STRATEGY_NAME = 'open-id';

export let openIdStrategy: StrategyAdapter<Strategy<User, Client>>;

export async function createStrategy(): Promise<void> {
  const issuer = await Issuer.discover('http://localhost:8080/auth/realms/i3-Market/.well-known/openid-configuration');
  const client = new issuer.Client({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_id: 'Backplane',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uris: ['https://localhost:3000/auth/openid/callback'],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    response_types: ['code'],
  });
  const strategy = new Strategy({client: client, sessionKey: 'true'}, verify);
  openIdStrategy = new StrategyAdapter(strategy, OPENID_STRATEGY_NAME);
}
