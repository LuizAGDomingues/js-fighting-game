export function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }

  const propNames = Reflect.ownKeys(value);
  for (const propName of propNames) {
    deepFreeze(value[propName]);
  }

  return Object.freeze(value);
}
