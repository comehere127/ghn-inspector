
export function empty(obj:unknown) {
  if (obj === undefined || obj === null) {
    return true;
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).length === 0;
  }

  if (typeof obj === 'string') {
    return obj === "";
  }

  return false;
}