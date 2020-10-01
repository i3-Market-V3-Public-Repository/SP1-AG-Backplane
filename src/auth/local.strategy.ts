import {Strategy} from 'passport-local';
import {findByEmail} from './users';
import * as bcrypt from 'bcryptjs';
import {StrategyAdapter} from '@loopback/authentication-passport';
import {Request} from '@loopback/rest';

function verify(request: Request, email: string, password: string, cb: Function) {
  const user = findByEmail(email);
  if (!user?.password) {
    return cb(null, false);
  }
  if (user && bcrypt.compareSync(password, user.password!)) {
    return cb(null, user);
  }
  return cb(null, false);
}

const localStrategy = new Strategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true,
}, verify);

export const LOCAL_STRATEGY_NAME = 'local';
export const localAuthStrategy = new StrategyAdapter(
  localStrategy,
  LOCAL_STRATEGY_NAME,
);
