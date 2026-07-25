export function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredValue<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage issues
  }
}

export function readBuilds<T>(key: string, fallback: T): T {
  return readStoredValue(key, fallback);
}

export function writeBuilds<T>(key: string, value: T) {
  writeStoredValue(key, value);
}
