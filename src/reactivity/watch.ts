import { effect } from "./effect";
import { traverse } from "../utils";

type WatchGetter = () => unknown | object;

export function watch(value: WatchGetter, cb: Function, options? = {}) {
  let getter: () => unknown;
  if (typeof value === "function") {
    getter = value;
  } else {
    getter = traverse(value);
  }
  let oldVal: any, newVal;
  const effectFn = effect(getter, {
    scheduler() {
      newVal = effectFn();
      cb(newVal, oldVal);
      oldVal = newVal;
    },
    lazy: true,
  });
  oldVal = effectFn();
}
