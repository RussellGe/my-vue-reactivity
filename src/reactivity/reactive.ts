import { def, isObject } from "../utils";
import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

const reactiveMap = new WeakMap();
const readonlyMap = new WeakMap();

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
  RAW = "__v_raw",
  SKIP = '__v_skip'
}

export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean;
  [ReactiveFlags.IS_READONLY]?: boolean;
  [ReactiveFlags.SKIP]?: boolean;
  [ReactiveFlags.RAW]?: any;
}

export function reactive(target: object) {
  if (isReadonly(target) || isReactive(target)) {
    return target;
  }

  return createReactiveObject(target, mutableHandlers, reactiveMap);
}

export function isReadonly(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_READONLY]);
}

export function isReactive(value: unknown): boolean {
  return !!(value && (value as Target)[ReactiveFlags.IS_REACTIVE]);
}

export function isProxy(value: unknown) {
  return isReactive(value) || isReadonly(value);
}

export function readonly(target: object) {
  return createReactiveObject(target, readonlyHandlers, readonlyMap);
}

export function markRaw<T extends object>(target: T) {
  def(target, ReactiveFlags.SKIP, true)
  return target
}

export function createReactiveObject(
  target: Target,
  baseHandler: ProxyHandler<any>,
  proxyMap: WeakMap<Target, any>
) {
  if (!isObject(target)) {
    return;
  }
  if (target[ReactiveFlags.RAW] || target[ReactiveFlags.SKIP]) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = new Proxy(target, baseHandler);
  proxyMap.set(target, proxy);
  return proxy;
}

export function toRaw<T>(observed: T): T {
  const raw = observed && (observed as Target)[ReactiveFlags.RAW];
  return raw ? toRaw(raw) : observed;
}
