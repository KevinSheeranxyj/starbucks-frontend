import Cookies from 'js-cookie';

const tokenKey = 'token';

export function getToken() {
  return Cookies.get(tokenKey);
}

export function setToken(token, days) {
  return Cookies.set(tokenKey, token, { expires: days });
}

export function removeToken() {
  return Cookies.remove(tokenKey);
}
