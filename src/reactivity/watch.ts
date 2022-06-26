import { effect } from "./effect";
import { traverse } from "../utils";

type WatchGetter = () => unknown | object;

export function watch(value: WatchGetter, cb: () => unknown, options? = {}) {
  let getter: () => unknown;
  if (typeof value === "function") {
    getter = value;
  } else {
    getter = traverse(value);
  }
  console.log("watch", getter);
  effect(getter, {
    scheduler() {
      cb();
    },
  });
}
