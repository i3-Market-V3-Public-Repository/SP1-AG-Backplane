export class User {
  email: string;
  password?: string;
}

const users: User[] = [];

export function findByEmail(email: string): User | undefined {
  console.log(`Looking for user ${email}`);
  for (const user of users) {
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
}

export function createUser(email: string, password?: string): User {
  console.log(`Create user ${email}`);
  const user: User = {
    email: email,
    password: password,
  };
  users.push(user);
  return user;
}
