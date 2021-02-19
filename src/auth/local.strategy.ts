import {Strategy} from 'passport-local';
import {findById} from './users';
import * as bcrypt from 'bcryptjs';
import {StrategyAdapter} from '@loopback/authentication-passport';

function verify(id: string, password: string, cb: Function) {
  const user = findById(id);
  if (!user?.password) {
    return cb(null, false);
  }
  if (user && bcrypt.compareSync(password, user.password)) {
    return cb(null, user);
  }
  return cb(null, false);
}

const localStrategy = new Strategy({
  usernameField: 'id',
  passwordField: 'password',
  session: false,
}, verify);

export const LOCAL_STRATEGY_NAME = 'local';
export const localAuthStrategy = new StrategyAdapter(
  localStrategy,
  LOCAL_STRATEGY_NAME,
);
