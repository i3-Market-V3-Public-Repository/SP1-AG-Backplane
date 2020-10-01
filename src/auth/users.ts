export class User {
  email: string;
  password?: string;
}

const users: User[] = [];

export function findByEmail(email: string): User | undefined {
  for (const user of users) {
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
}

export function createUser(email: string, password?: string): User {
  const user: User = {
    email: email,
    password: password,
  };
  users.push(user);
  return user;
};
