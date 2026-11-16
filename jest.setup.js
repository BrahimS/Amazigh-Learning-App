/**
 * Jest setup: in-memory AsyncStorage mock (the package ships no Jest mock in v3)
 * and any global test configuration.
 */

jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};

  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) => Promise.resolve(store[key] ?? null)),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store = {};
        return Promise.resolve();
      }),
      getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
      multiSet: jest.fn((entries: Array<[string, string]>) => {
        entries.forEach(([key, value]) => {
          store[key] = value;
        });
        return Promise.resolve();
      }),
      multiGet: jest.fn((keys: string[]) =>
        Promise.resolve(keys.map(key => [key, store[key] ?? null])),
      ),
      multiRemove: jest.fn((keys: string[]) => {
        keys.forEach(key => {
          delete store[key];
        });
        return Promise.resolve();
      }),
    },
  };
});
