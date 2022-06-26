import { effect } from "./effect";
import { traverse } from "../utils";

type WatchGetter = () => unknown | object;
interface WatchOptions {
  immediate?: boolean;
}
export function watch(
  value: WatchGetter,
  cb: Function,
  options: WatchOptions = {}
) {
  let getter: () => unknown;
  if (typeof value === "function") {
    getter = value;
  } else {
    getter = traverse(value);
  }
  let oldVal: any, newVal;
  const job = () => {
    newVal = effectFn();
    cb(newVal, oldVal);
    oldVal = newVal;
  };
  const effectFn = effect(getter, {
    scheduler: job,
    lazy: true,
  });
  oldVal = effectFn();
  if (options?.immediate) {
    job();
  }
}
