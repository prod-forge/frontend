export type KeyValueStorage = {
  getItem(key: string): Promise<null | string>;
  removeItem(key: string): Promise<void>;
  setItem(key: string, value: string): Promise<void>;
};
