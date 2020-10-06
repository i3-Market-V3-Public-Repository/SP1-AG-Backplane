import {UserProfile} from '@loopback/security';

export class User {
  email: string;
  password?: string;
  scopes: string[] = [];
}

export interface BackplaneUserProfile extends UserProfile {
  scopes: string[];
}

const users: Map<string, User> = new Map();

export function findByEmail(email: string): User | undefined {
  console.log(`Looking for user ${email}`);
  const user = users.get(email);
  return user ? Object.assign({}, user) : undefined;
}

export function createUser(email: string, password?: string, scopes: string[] = []): User {
  if (users.has(email)) {
    throw Error('User already exists');
  }
  console.log(`Create user ${email}`);
  const user: User = {
    email: email,
    password: password,
    scopes: scopes,
  };
  users.set(email, user);
  return Object.assign({}, user);
}

export function updateUser(email: string, scopes: string[]): User {
  const user = users.get(email);
  if (!user) {
    throw Error('User does not exists');
  }
  user.scopes = scopes;
  return Object.assign({}, user);

}

export function setUserPassword(email: string, password: string): User {
  const user = users.get(email);
  if (!user) {
    throw Error('User does not exists');
  }
  user.password = password;
  return Object.assign({}, user);
}
