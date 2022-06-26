import { effect } from "vue";
import { traverse } from "../utils";

type WatchGetter = () => unknown | object;

export function watch(value: WatchGetter, cb: () => unknown, options? = {}) {
  let getter: () => unknown;
  if (typeof value === "function") {
    getter = value;
  } else {
    getter = traverse(value);
  }
  effect(getter, cb());
}
