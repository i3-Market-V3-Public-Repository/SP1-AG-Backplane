import {getPublicUri} from "../index";

export const JWT_DEFAULT_OPTIONS = {session: false, failureRedirect: '/login'};
export const JWT_SECRET = 'secret';
export const JWT_ISS = getPublicUri();
export const JWT_AUD = getPublicUri();
export const JWT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: true,
};
