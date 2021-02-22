import {UserProfile} from '@loopback/security';
import {User} from '../models';

export interface BackplaneUserProfile extends UserProfile {
  id: string;
  claims: string[];
}

const users: Map<string, User> = new Map();

export function findById(id: string): User | undefined {
  console.log(`Looking for user ${id}`);
  const user = users.get(id);
  return user ? Object.assign({}, user) : undefined;
}

export function createUser(id: string, claims: string[], password?: string): User {
  if (users.has(id)) {
    throw Error('User already exists');
  }
  console.log(`Create user ${id} with scopes [${claims}]`);
  const user = new User({
    id: id,
    password: password,
    claims: claims,
  });
  users.set(id, user);
  return Object.assign({}, user);
}

export function updateUser(id: string, claims: string[]): User {
  const user = users.get(id);
  if (!user) {
    throw Error('User does not exists');
  }
  user.claims = claims;
  return Object.assign({}, user);

}

export function setUserPassword(id: string, password: string): User {
  const user = users.get(id);
  if (!user) {
    throw Error('User does not exists');
  }
  user.password = password;
  return Object.assign({}, user);
}
