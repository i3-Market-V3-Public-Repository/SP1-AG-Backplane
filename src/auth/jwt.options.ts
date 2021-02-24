import {PUBLIC_URI} from "../index";


export const JWT_DEFAULT_OPTIONS = {session: false, failureRedirect: '/login'};
export const JWT_SECRET = 'secret';
export const JWT_ISS = PUBLIC_URI
export const JWT_AUD = PUBLIC_URI
export const JWT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: true,
};
