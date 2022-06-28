import { hasChanged, isObject } from '../utils'
import type { ReactiveEffect } from './effect'
import { isTracking, trackEffect, triggerEffect } from './effect'
import { reactive, toRaw } from './reactive'

declare const RefSymbol: unique symbol
export interface Ref<T = any> {
  value: T
  /**
   * Type differentiator only.
   * We need this to be in public d.ts but don't want it to show up in IDE
   * autocomplete, so we use a private Symbol instead.
   */
  [RefSymbol]: true
}

class RefImpl<T> {
  private _value: T
  private _rawValue: T
  public deps: Set<ReactiveEffect>
  public readonly __v_isRef = true
  constructor(val: T) {
    this._rawValue = val
    this._value = convert(val)
    this.deps = new Set()
  }

  get value() {
    trackRefEffect(this)
    if (isRef(this._value))
      return unref(this._value)
    return this._value
  }

  set value(val: any) {
    if (hasChanged(val, this._rawValue)) {
      this._rawValue = val
      this._value = convert(val)
      triggerRefEffect(this)
    }
  }
}

function convert(obj: any) {
  return isObject(obj) ? reactive(obj) : obj
}
function trackRefEffect(ref: RefImpl<any>) {
  if (isTracking())
    trackEffect(ref.deps)
}
function triggerRefEffect(ref: RefImpl<any>) {
  ref = toRaw(ref)
  if (ref.deps)
    triggerEffect(ref.deps)
}

export function isRef(ref: any) {
  return !!ref?.__v_isRef
}

export function unref(ref: any) {
  if (isRef(ref))
    return ref.value
  else return ref
}

export function ref<T extends object>(
  value: T
): [T] extends [Ref] ? T : Ref<T>
export function ref<T>(value: T): Ref<T>
export function ref<T = any>(): Ref<T | undefined>
export function ref(value?: unknown) {
  return createRef(value)
}

function createRef(rawValue: unknown) {
  if (isRef(rawValue))
    return rawValue

  else
    return new RefImpl(rawValue)
}
