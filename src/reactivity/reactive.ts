import { isObject } from "../utils";
import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean;
  [ReactiveFlags.IS_READONLY]?: boolean;
}

export function reactive(target: object) {
  if (isReadonly(target)) {
    return target;
  }
  return createReactiveObject(target, mutableHandlers);
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
  return createReactiveObject(target, readonlyHandlers);
}

export function createReactiveObject(
  target: object,
  baseHandler: ProxyHandler<any>
) {
  if (!isObject(target)) {
    return;
  }
  return new Proxy(target, baseHandler);
}
