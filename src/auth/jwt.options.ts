

export const JWT_DEFAULT_OPTIONS = {session: false, failureRedirect: '/login'};
export const JWT_SECRET = 'secret';
export const JWT_ISS = process.env.PUBLIC_URI
export const JWT_AUD = process.env.PUBLIC_URI
export const JWT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: true,
};
