/**
 * JSON serializer for `useLocalStorage`.
 *
 * Left to infer from a `null` default, useStorage picks its "any" serializer,
 * whose writer is `String(value)`; an object then persists as the useless text
 * "[object Object]" and reads back as garbage. Reading is deliberately
 * forgiving because local storage is user-editable and may still hold a value
 * written by an older build.
 */
export function jsonSerializer<T>() {
  return {
    read: (raw: string): T | null => {
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },
    write: (value: T | null) => JSON.stringify(value),
  };
}
