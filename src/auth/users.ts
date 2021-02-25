import {UserProfile} from '@loopback/security';
import {User} from '../models';

export interface BackplaneUserProfile extends UserProfile {
  id: string;
  scope: string;
}

const users: Map<string, User> = new Map();

export function findById(id: string): User | undefined {
  console.log(`Looking for user ${id}`);
  const user = users.get(id);
  return user ? Object.assign({}, user) : undefined;
}

export function createUser(id: string, scope: string): User {
  if (users.has(id)) {
    throw Error('User already exists');
  }
  console.log(`Create user ${id} with scopes [${scope}]`);
  const user = new User({
    id: id,
    scope: scope,
  });
  users.set(id, user);
  return Object.assign({}, user);
}

export function updateUser(id: string, scope: string): User {
  const user = users.get(id);
  if (!user) {
    throw Error('User does not exists');
  }
  user.scope = scope;
  return Object.assign({}, user);

}
