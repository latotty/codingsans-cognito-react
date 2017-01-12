export function user(state = {}, action) {
  switch (action.type) {
    case 'AUTHENTICATE':
      state = action.user;
      return state;
    default:
      return state;
  }
}
