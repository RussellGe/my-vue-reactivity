import { track, trigger } from "./effect";




const data = {
  foo: 1,
  bar: 1,
};

export const obj = new Proxy(data, {
  get(target, key) {
    if (!(key in target)) return;
    track(target, key);
    const res = Reflect.get(target, key);
    return res;
  },
  set(target, key, newVal) {
    const result = Reflect.set(target, key, newVal);
    trigger(target, key);
    return result;
  },
});


