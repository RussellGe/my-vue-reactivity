import { isObject } from "../utils";
import { track, trigger } from "./effect";
import { isProxy, reactive, ReactiveFlags, readonly, toRaw } from "./reactive";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

function createGetter(isReadonly = false, shallow = false) {
  return function get(target: object, key: string, receiver: object): unknown {
    const res = Reflect.get(target, key, receiver);
    if (key === ReactiveFlags.RAW) {
      return target;
    }
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    if (shallow) {
      return res;
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    if (!isReadonly) {
      track(target, key);
    }
    return res;
  };
}

function createSetter(shallow = false) {
  return function set(
    target: object,
    key: string,
    value: any,
    receiver: object
  ) {
    if (!shallow) {
      value = toRaw(value);
    }
    const res = Reflect.set(target, key, value, receiver);
    trigger(target, key);
    return res;
  };
}

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target: object, key: string) {
    console.warn(`key:${key} set失败 因为target是readonly的`);
    return true;
  },
};
