export function authenticate(user) {
  return {
    type: 'AUTHENTICATE',
    user,
  }
}
